import { SignalType } from '../../context.type'
import { saveDoc } from '../../Data/signals/saveDoc'
import * as set from 'cerebral-addons/set'

export const name: SignalType =
[ set ( 'output:/type', 'user' )
, set ( 'output:/key', 'name' )
, ...saveDoc
]
