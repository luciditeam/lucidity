import { LiveBlock } from './block'
import { LiveBranch } from './Branch'
import { extractSources } from './extractSources'
import { makeId, SourceFragment, StringMap } from './types'
import { compile } from 'blocks/playback/lib/compile';

let project: LiveProject

export function getProject (): LiveProject {
  if ( !project ) {
    project = new LiveProject
  }
  return project
}

export function newProject
(): LiveProject {
  return new LiveProject
}

export class LiveProject {
  branches: StringMap < LiveBranch >
  blockById: StringMap < LiveBlock >
  blocksByName: StringMap < LiveBlock [] >
  fragments: StringMap < SourceFragment >
  // Root context
  context: { [ key: string ]: any }
  // Type of context
  provide: { [ key: string ]: string }

  constructor () {
    this.branches = {}
    this.blockById = {}
    this.blocksByName = {}
    this.fragments = {}
    this.context = {}
    this.provide = {}
  }

  newBranch ( connect?: string ) {
    return new LiveBranch ( this, connect )
  }

  newBlock ( branchId: string ) {
    const branch = this.branches [ branchId ]
    return new LiveBlock ( branch )
  }

  addBranch ( branch: LiveBranch ) {
    this.branches [ branch.id ] = branch
    this.changed ()
  }

  addBlock ( block: LiveBlock ) {
    if ( ! block.lang ) {
      block.lang = 'ts'
    }
    const { id, name } = block

    if ( this.blockById [ id ] ) {
      throw new Error ( `Duplicate block id '${ id }'.`)
    }
    if ( ! name ) {
      throw new Error ( `Missing 'name' in block id '${ id }.`)
    }

    this.blockById [ id ] = block
    let list = this.blocksByName [ name ]

    if ( ! list ) {
      list = []
      this.blocksByName [ name ] = list
    } else if ( list [ 0 ].lang !== block.lang ) {
      throw new Error ( `Blocks of the same name should share the same lang.` )
    }
    list.push ( block )
    this.changed ()
  }

  setContext ( key: string, type: string, ctx: any ) : void {
    this.context [ key ] = ctx
    this.provide [ key ] = type
    this.changed ()
  }

  addFragment ( fragment: SourceFragment ) {
    this.fragments [ fragment.id ] = fragment
    fragment.sources = extractSources
    ( fragment.source
    , fragment.lang 
    ).sources
    this.changed ()
  }

  appendSource ( fragmentId: string, source: string ) {
    const fragment = this.fragments [ fragmentId ]
    const s = fragment.source
    fragment.source = s === ''
      ? source
      : s + '\n' + source
    fragment.sources = extractSources
    ( fragment.source
    , fragment.lang 
    ).sources
    this.changed ()
  }

  setBlockSource ( blockId: string, source: string ) {
    const block = this.blockById [ blockId ]
    block.source = source
    this.changed ()
  }

  setFragmentSource ( fragmentId: string, source: string ) {
    this.changed ()
  }

  changed () {
    compile ( this ).main ()
  }
}