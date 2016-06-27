export * from './signals/start'
export * from './signals/stop'
export interface FileStorageSignalsType {
  changed ( opt: { type: string, message?: string } )
  file ( opt: { path: string, op: string, source: string } )
  library ( opt: { path: string, op: string, source: string } )
}

import { changed } from './signals/changed'
import { start } from './helper/FileStorageHelper'

export const FileStorage =
(options = {}) => {
  return (module, controller) => {
    module.addState
    ( { status: 'offline'
      }
    )

    module.addSignals
    ( { changed
      }
    )

    start ( { controller } )

    return {} // meta information
  }
}
