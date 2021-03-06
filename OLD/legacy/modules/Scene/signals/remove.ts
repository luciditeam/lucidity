import { SignalType } from '../../context.type'
import { removeAction } from '../actions/removeAction'
import { save } from '../../Data/signals/save'
import { status } from '../../Status'

export const remove: SignalType =
[ removeAction
, { success: [ ...save ]
  , error: [ status ]
  }
]
