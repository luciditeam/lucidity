import { ComponentType } from '../../Graph/types/ComponentType'
import { debug, buildCache, CacheType, clearCache, stat, resolve, renameSync, mkdirSync, sanitize } from './FileStorageUtils'
import { watchPath, Watcher } from './watchPath'
import { updateFiles, saveLucidityJson, saveProjectSettings } from './updateFiles'

const projectCache = clearCache ( {} )
let projectPath

interface CacheById {
  [ key: string ]: CacheType
}

const sceneCacheById: CacheById = {}

export const loadProject =
( event
, path: string
, project: ComponentType
, scenes: ComponentType[]
) => {
  const sender = event.sender
  projectPath = path
  const root = resolve ( path, 'project' )
  loadScene ( root, project, projectCache, sender )

  const scenesPath = resolve ( path, 'scenes' )
  const s = stat ( scenesPath )
  if ( !s ) {
    mkdirSync ( scenesPath )
  }

  for ( const k in sceneCacheById ) {
    const cache = sceneCacheById [ k ]
    clearCache ( cache )
    delete sceneCacheById [ k ]
  }

  for ( const scene of scenes ) {
    const root = resolve ( scenesPath, sanitize ( scene.name ) )
    const cache = sceneCacheById [ scene._id ] = clearCache ( {} )
    loadScene ( root, scene, cache, sender )
  }
  event.sender.send ( 'done' )
}

const loadScene =
( path: string
, comp: ComponentType
, cache: CacheType
, sender
) => {
  debug ( 'load s', null, comp.name )
  const s = stat ( path )
  if ( !s ) {
    mkdirSync ( path )
  }
  clearCache ( cache )
  cache.path = path
  cache.compName = comp.name

  buildCache ( cache )
  updateFiles ( cache, comp, sender )
  saveLucidityJson ( cache, comp, sender )

  if ( comp.type === 'project' ) {
    saveProjectSettings ( cache, comp, sender )
  }

  cache.watcher = watchPath
  ( path
  , comp
  , cache
  , 'file-changed'
  , sender
  , cache.watcher
  )
}

export const projectChanged =
( event
, comp: ComponentType
) => {
  const cache = projectCache
  // app changes take over FS cache
  updateFiles ( cache, comp, event.sender, true )
  saveLucidityJson ( cache, comp, event.sender )
  saveProjectSettings ( cache, comp, event.sender )
  event.sender.send ( 'done' )
}

export const sceneChanged =
( event
, comp: ComponentType
) => {
  let cache = sceneCacheById [ comp._id ]
  if ( !cache ) {
    cache = clearCache ( {} )
    sceneCacheById [ comp._id ] = cache
    cache.path = resolve ( projectPath, 'scenes', sanitize ( comp.name ) )
    cache.compName = comp.name
  }
  else if ( comp.name !== cache.compName ) {
    debug ( 'scenemv', null, comp.name )
    // move
    const newPath = resolve ( projectPath, 'scenes', sanitize ( comp.name ) )
    const s = stat ( newPath )
    if ( !s || s.isDirectory () ) {
      if ( !s ) {
        renameSync ( cache.path, newPath )
      }
      const sender = event.sender
      cache.watcher = watchPath
      ( newPath
      , comp
      , cache
      , 'file-changed'
      , sender
      , cache.watcher
      )
      cache.path = newPath
      cache.compName = comp.name
    }

    else {
      const msg = `Could not rename scene (path exists '${newPath}')`
      console.log ( msg )
      event.sender.send ( 'error', msg )
      return
    }
  }

  const path = cache.path
  // app changes take over FS cache
  updateFiles ( cache, comp, event.sender, true )
  saveLucidityJson ( cache, comp, event.sender )
  event.sender.send ( 'done' )
}
