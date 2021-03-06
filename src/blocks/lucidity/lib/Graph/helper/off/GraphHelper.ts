import { BlockType, PlaybackMetaType, SlotType, nextBlockId, rootBlockId } from '../../Block'
import { createBlock, mainBlock, updateBlock } from '../../Block/helper/BlockHelper'
import { CompilerError } from '../../Code'
import { GraphType, NodeType, NodeByIdType, nextNodeId, rootNodeId } from '../types'
import { createNode } from './NodeHelper'
import { defaultMeta, mainContextProvide } from '../../Playback/helper/PlaybackHelper'

import { Immutable as IM } from './Immutable'

export interface DoneGraphCallback {
  ( errors: CompilerError[] | undefined, graph?: GraphType ): void
}

const checkFreeze =
( graph: GraphType
) => {
  if ( Object.isFrozen ( graph ) ) {
    graph =
    { nodesById: Object.assign ( {}, graph.nodesById )
    , blocksById: graph.blocksById
    }
  }
  else {
    graph.blocksById = Object.freeze ( graph.blocksById )
  }

  check ( graph ) // this will freeze nodes
  graph.nodesById = Object.freeze ( graph.nodesById )
  return Object.freeze ( graph )
}

const check =
( graph: GraphType
, context: any = mainContextProvide
, nodeId: string = rootNodeId
, allvoid: string[] = []
, parentError: string | undefined = undefined
, shouldBeVoid: boolean = false
): boolean => {
  let node: NodeType = graph.nodesById [ nodeId ]
  const block = graph.blocksById [ node.blockId ]
  const meta = block.meta
  if ( meta === undefined ) {
    throw new Error ( 'No block.meta (??)' )
  }
  const expect = meta.expect || {}
  const cerr = parentError ? [ parentError ] : []
  let voidUpdateError = false
  let all: string[] = []

  if ( shouldBeVoid && meta.update ) {
    cerr.push ( `invalid 'update' (should not be typed)` )
    voidUpdateError = true
  }

  for ( const k in expect ) {
    const e = expect [ k ]
    const c = context [ k ]
    if ( !c ) {
      cerr.push
      ( `missing '${k}': ${e}`)
    }
    else if ( e !== c ) {
      cerr.push
      ( `invalid '${k}': ${c} instead of ${e}` )
    }
  }

  const childrenTypes = meta.children
  const children = node.children
  let childrenm: string[] | undefined = undefined
  const nodesById = graph.nodesById
  const blocksById = graph.blocksById
  const serr = []
  if ( Array.isArray ( childrenTypes ) ) {
    for ( let i = 0; i < childrenTypes.length; ++i ) {
      const e = childrenTypes [ i ]
      const n = nodesById [ children [ i ] ]
      let b
      if ( n ) {
        b = blocksById [ n.blockId ]
      }
      if ( !b ) {
        serr [ i ] = `missing child ${i+1}: ${e}`
      } else {
        const bmeta = b.meta
        if ( !bmeta ) {
          throw new Error ( 'No b.meta (??)' )
        }
        let c = bmeta.update
        if ( !c ) {
          // try to find child in grand-children
          if ( !childrenm ) {
            childrenm = Object.assign ( [], children )
          }

          let nc: NodeType | undefined = n
          while ( !c && nc ) {
            const childId: string = nc.children [ 0 ]
            nc = undefined
            if ( childId ) {
              nc = nodesById [ childId ]
              if ( nc ) {
                const b = blocksById [ nc.blockId ]
                const u = bmeta.update
                if ( u ) {
                  // found child (will check if type is correct)
                  childrenm [ i ] = childId
                  c = u
                }
              }
            }
          }
        }

        if ( e !== c ) {
          serr [ i ] = `invalid child ${i+1}: ${c} instead of ${e}`
        }
      }
    }
  }

  const valid = cerr.length === 0 && serr.length === 0

  if ( valid ) {
    if ( !block.meta ) {
      throw new Error ( 'No block.meta (??)' )
    }

    if ( block.meta.isvoid ) {
      // add ourself to the capturing of void updates
      allvoid.push ( nodeId )
    }
    // valid
    const closed = node.closed
    node =
    { id: nodeId
    , blockId: node.blockId
    , parent: node.parent
    , children
    }
    if ( closed ) {
      node.closed = true
    }
    if ( childrenTypes ) {
      // Only set direct children for helper if we have explicit
      // types for them.
      node.childrenm = childrenm || children
    }
    if ( block.meta.all ) {
      // grab our own list of nodes
      all = []
      node.all = all
    }
  }
  else {
    // invalid
    node =
    { id: nodeId
    , blockId: node.blockId
    , parent: node.parent
    , closed: node.closed
    , children
    , invalid: true
    , cerr
    , serr
    }
  }

  const sub = context.set ( meta.provide || {} )

  const perror = node.invalid ?
    `Parent '${block.name}' invalid.` : undefined

  const inlen = childrenTypes ? childrenTypes.length : undefined
  for ( let i = 0; i < children.length; ++i ) {
    const childId = children [ i ]
    if ( childId ) {
      if ( inlen ) {
        // Typed children
        const err = i >= inlen ? `Not linked to parent: detached` : undefined
        check ( graph, sub, childId, all, err || perror )
        if ( !node.invalid ) {
          // valid node
          const n = nodesById [ childId ]
          if ( n.invalid ) {
            // Invalid typed child: we become invalid as well
            node.invalid = true
            node.serr = [ `invalid child ${i+1}` ]
          }
        }
      }
      else {
        // No type definitions for children: update must have '():void' type.
        if ( check ( graph, sub, childId, all, perror, true ) ) {
          serr [ i ] = `invalid child ${i+1}: update is typed`
        }
      }
    }
  }

  graph.nodesById [ nodeId ] = Object.freeze ( node )

  if ( !block.meta ) {
    throw new Error ( 'No block.meta (??)' )
  }

  if ( !block.meta.all && !node.invalid ) {
    // node is valid and does not capture `isvoid` children.
    // Add new elements in all to allvoid.
    for ( const nid of all ) {
      allvoid.push ( nid )
    }
  }

  return voidUpdateError
}

const insertInGraph =
( newgraph: GraphType
, oldgraph: GraphType
, oldid: string
, parentId: string | undefined
, tail: { nid?: string }
, dropId?: string
) => {
  const oldnode = oldgraph.nodesById [ oldid ]
  let block: BlockType & { _copyblock?: boolean } = oldgraph.blocksById [ oldnode.blockId ]

  if ( !block._copyblock ) {
    let bid = block.id
    if ( newgraph.blocksById [ bid ] ) {
      bid = nextBlockId ( newgraph.blocksById )
    }
    block = Object.assign ( {}, block, { id: bid } )
    newgraph.blocksById [ bid ] = Object.freeze ( block )

    // make sure we do not add it twice (in case it's an alias)
    oldgraph.blocksById [ oldnode.blockId ] =
    Object.assign ( {}, block, { _copyblock: true } )
  }

  // our new node id
  const nid = nextNodeId ( newgraph.nodesById )
  // lock this id
  const node: NodeType =
  { id: nid
  , blockId: block.id
  , closed: oldnode.closed
  , parent: parentId
  , children: []
  }

  newgraph.nodesById [ nid ] = node

  if ( !tail.nid && !oldnode.children [ 0 ] ) {
    // found tail
    tail.nid = nid
  }

  // map our children with new nodes and ids
  let nochild = true
  const children: ( string | undefined ) [] = []
  const ochildren = oldnode.children
  const len = ochildren.length
  for ( let i = 0; i < len; ++i ) {
    const oid = ochildren [ i ]
    if ( oid === undefined || oid === dropId ) {
      if ( i === len - 1 ) {
        // ignore
      }
      else {
        children.push ( undefined )
      }
    }
    else {
      nochild = false
      children.push
      ( insertInGraph
        ( newgraph
          , oldgraph
          , oid
          , nid
          , tail
          , dropId
        )
      )
    }
  }
  node.children = < string [] > children // (??)

  if ( nochild ) {
    node.children = []
  }

  newgraph.nodesById [ nid ] = node

  return nid
}

const copyNodes =
( nodesById: NodeByIdType
) => {
  const r: any = {}
  for ( const k in nodesById ) {
    r [ k ] = Object.assign ( {}, nodesById [ k ] )
  }
  return r
}


export const createGraph =
( name: string | undefined = undefined
, source: string | undefined = undefined
): Promise<GraphType> => {
  let create = () => createBlock ( name, source )
  if ( name === undefined && source === undefined ) {
    create = () => mainBlock ()
  }
  const p = new Promise<GraphType>
  ( ( resolve, reject ) => {
      create ()
      .then ( ( block ) => {
        const nid =  rootNodeId
        const g = Object.freeze
        ( { nodesById: Object.freeze
            ( { [ nid ]: createNode ( block.id, nid, undefined ) } )
          , blocksById: Object.freeze
            ( { [ block.id ]: block } )
          , blockId: block.id
          }
        )
        resolve ( g )
      })
      .catch ( reject )
    })
  return p
}

export const updateGraphSource =
( graph: GraphType
, blockId: string
, source: string
, done: DoneGraphCallback
) => {
  const oblock = graph.blocksById [ blockId ]
  updateBlock ( oblock, { source } )
  .then ( ( block ) => {
    const g = IM.update ( graph, 'blocksById', blockId, block )
    done ( undefined, checkFreeze ( g ) )
  })
  .catch ( ( errors ) => {
    done ( errors )
  })
}

export const insertGraph =
( graph: GraphType
, parentId: string
, pos: number
, achild: GraphType
) : GraphType => {
  // add nodes
  let g = // not frozen to ease operations
  { nodesById: copyNodes ( graph.nodesById )
  , blocksById: Object.assign ( {}, graph.blocksById )
  , blockId: graph.blockId
  }

  const oldgraph =
  { nodesById: achild.nodesById
    // we write in there during insertInGraph to mark
    // transfered blocks
  , blocksById: Object.assign ( {}, achild.blocksById )
  }

  const tail = {}
  // copy nodes and rename ids
  const nid = insertInGraph
  ( g
  , oldgraph
  , rootNodeId
  , parentId
  , tail
  )

  g.blockId = g.nodesById [ nid ].blockId

  // link in parent
  const parent = g.nodesById [ parentId ]
  parent.children = IM.insert ( parent.children, pos, nid )

  return checkFreeze ( g )
}

export const appendGraph =
( graph: GraphType
, parentId: string
, child: GraphType
) : GraphType => {
  return insertGraph ( graph, parentId, -1, child )
}

// slip a new graph between parent and child
// FIXME: need to detect deepest child on first slot in graph
export const slipGraph =
( graph: GraphType
, parentId: string
, pos: number
, achild: GraphType
) : GraphType => {
  let g = // not frozen to ease operations
  { nodesById: copyNodes ( graph.nodesById )
  , blocksById: Object.assign ( {}, graph.blocksById )
  , blockId: graph.blockId
  }

  const oldgraph =
  { nodesById: achild.nodesById
  , blocksById: Object.assign ( {}, achild.blocksById )
  }

  const tail = { nid: undefined }
  // copy nodes and rename ids
  const nid = insertInGraph
  ( g
  , oldgraph
  , rootNodeId
  , parentId
  , tail
  )

  g.blockId = g.nodesById [ nid ].blockId

  // get previous child at this position
  const parent = g.nodesById [ parentId ]
  const previd = parent.children [ pos ]
  const prevnode = g.nodesById [ previd ]

  // This is where the previous child will go
  const tnid = tail.nid // ??? tnid ??? nid ???
  if ( !tnid ) {
    throw new Error ( 'No tail.nid (??).' )
  }

  const tailnode = g.nodesById [ tnid ]

  // tail.children [ 0 ] = previd
  tailnode.children = IM.aset ( tailnode.children, 0, previd )

  prevnode.parent = tail.nid

  // parent.children [ pos ] = nid
  parent.children = IM.aset ( parent.children, pos, nid )

  return checkFreeze ( g )
}

// Cut a branch a return the branch as a new graph.
export const cutGraph =
( graph: GraphType
, nodeId: string
) : GraphType => {
  let g = // not frozen to ease operations
  { nodesById: {}
  , blocksById: {}
  , blockId: rootBlockId
  }

  const oldgraph =
  { nodesById: graph.nodesById
  , blocksById: Object.assign ( {}, graph.blocksById )
  }

  const tail = { nid: undefined }
  insertInGraph
  ( g
  , oldgraph
  , nodeId
  , undefined
  , tail
  )

  return checkFreeze ( g )
}

// Remove a branch and return the smaller tree.
export const dropGraph =
( graph: GraphType
, nodeId: string
) : GraphType => {
  let g = // not frozen to ease operations
  { nodesById: {}
  , blocksById: {}
  , blockId: rootBlockId
  }

  const oldgraph =
  { nodesById: graph.nodesById
  , blocksById: Object.assign ( {}, graph.blocksById )
  }

  const tail = { nid: undefined }
  insertInGraph
  ( g
  , oldgraph
  , rootNodeId
  , undefined
  , tail
  , nodeId
  )

  return checkFreeze ( g )
}
