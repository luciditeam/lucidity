// modules
import { App } from '../modules/App'
import { setupScreenEvents } from '../modules/App/helper/WindowEvents'
import { Block } from '../modules/Block'
import { Code } from '../modules/Code'
import { Data } from '../modules/Data'
import { DragDrop } from '../modules/DragDrop'
import { Factory } from '../modules/Factory'
import { FileStorage } from '../modules/FileStorage'
import { Graph } from '../modules/Graph'
import { Library } from '../modules/Library'
import { Midi } from '../modules/Midi'
import { Playback } from '../modules/Playback'
import { Project } from '../modules/Project'
import { Scene } from '../modules/Scene'
import { Status } from '../modules/Status'
import { User } from '../modules/User'
import { Sync } from '../modules/Sync'

import * as Router from 'cerebral-module-router'
import * as Controller from 'cerebral'
import * as Devtools from 'cerebral-module-devtools'
import * as Http from 'cerebral-module-http'
import * as Model from 'cerebral-model-baobab'

import { Component, render } from '../app/Component' // Component for jsx on this page
import { App as AppView } from '../app/App'
//import { TestView as AppView } from './TestView'

const model = Model ( {} )
const controller = Controller ( model )
const router = Router
( { '/': 'app.homeUrl'
  , '/project': 'app.projectsUrl'
  , '/project/:_id': 'app.projectUrl'
  , '/user': 'app.userUrl'
  //, '/logout': 'app.logoutUrl'
  //, '/login': 'app.loginUrl'
  }
, { onlyHash: true
  , mapper: { query: true }
  }
)

controller.addModules
( { app: App ()
  , block: Block ()
  , code: Code ()
  , data: Data ()
  , $dragdrop: DragDrop ()
  , $factory: Factory ()
  , $filestorage: FileStorage ()
  , graph: Graph ()
  , devtools: Devtools ()
  , http: Http ()
  , library: Library ()
  , midi: Midi ()
  , $playback: Playback ()
  , project: Project ()
  , router
  , scene: Scene ()
  , $status: Status ()
  , user: User ()
  , $sync: Sync ()
  }
)

setupScreenEvents ( controller )

render
( () => <AppView/>
, document.getElementById ( 'app' )
, controller
)


controller.getSignals().app.mounted ()
