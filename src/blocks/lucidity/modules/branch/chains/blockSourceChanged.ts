import { ActionContext, CerebralChain } from 'builder'
import { sequence } from 'cerebral'
import { set } from 'cerebral/operators'
import { props, state } from 'cerebral/tags'
import { changeBlockSource, getProject } from 'playback'

function changeSource
( { props, state }: ActionContext
) {
  const blockId = props.path.split ( '.' ).slice ( -1 ) [ 0 ]
  const source = props.source
  changeBlockSource ( getProject (), blockId, source )
}

export const blockSourceChanged: CerebralChain =
sequence
( 'branch.blockSourceChanged'
, [ set ( state`${ props`path` }.source`, props`source` )
  , changeSource
  ]
)