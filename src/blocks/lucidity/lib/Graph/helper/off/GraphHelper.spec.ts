import { describe } from '../../Test/runner'
import { GraphType, rootNodeId } from '../types'
import { appendGraph, createGraph, cutGraph, dropGraph, insertGraph, slipGraph } from './GraphHelper'
import { createNode } from './NodeHelper'
import { rootBlockId } from '../../Block/BlockType'

import { Immutable as IM } from './Immutable'

const SOURCE_A =
`export const render = ( ctx, child, child2 ) => {}
`
const SOURCE_foo =
`export const render = ( ctx, child, child2 ) => {}
export const meta =
{ expect: { bar: 'bar.type', baz: 'baz.type' }
}`

const traverse =
( graph: GraphType ) : string[] => {

  const res: string[] = []
  const op = ( nid, s = '' ) => {
    if ( nid ) {
      const node = graph.nodesById [ nid ]
      const block = graph.blocksById [ node.blockId ]
      res.push ( `${s}${nid}:${node.blockId}:${block.name}` )
      for ( const k of node.children ) {
        op ( k, s + ' ' )
      }
    }
    else {
      res.push ( `${s}${nid}` )
    }
  }

  op ( rootNodeId )
  return res
}

describe ( 'createGraph', ( it, setupDone ) => {
  let graph: GraphType
  createGraph ().then ( ( g ) => {
    graph = g
    setupDone ()
  })
  .catch ( ( err ) => {
    console.log ( 'Error in createGraph setup', err )
  })

  it ( 'create node for block', ( assert ) => {
    assert.equal
    ( graph.nodesById [ rootNodeId ]
    , { id: rootNodeId
      , blockId: rootBlockId
      , parent: null
      , children: []
      }
    )
  })

  it ( 'should select block', ( assert ) => {
    assert.equal ( graph.blockId, rootBlockId )
  })

  it ( 'should save block', ( assert ) => {
    assert.equal
    ( graph.blocksById [ rootBlockId ].name, 'main' )
    assert.equal
    ( graph.blocksById [ rootBlockId ].id, rootBlockId )
  })

  it ( 'should be immutable', ( assert ) => {
    assert.throws
    ( () => {
        graph.nodesById [ 'foo' ] =
        createNode ( 'abc', 'idid', null )
      }
    )
  })

  it ( 'should set meta', ( assert, done ) => {
    createGraph ( 'foo', SOURCE_foo )
    .then ( ( graph ) => {
      assert.equal
      ( graph.blocksById [ rootBlockId ].meta
      , { expect: { bar: 'bar.type'
                  , baz: 'baz.type'
                  }
        }
      )
      done ()
    })
  })

})

describe ( 'appendGraph', ( it, setupDone ) => {
  let graph: GraphType
  let graph2: GraphType

  Promise.all
  ( [ createGraph ()
      .then ( ( g ) => { graph = g } )
    , createGraph ( 'foo', SOURCE_A )
      .then ( ( g ) => { graph2 = g } )
    ]
  )
  .then ( () => {
    graph = appendGraph ( graph, rootNodeId, graph2 )
    setupDone ()
  })

  it ( 'should append child in parent', ( assert ) => {
      assert.equal
      ( graph.nodesById [ rootNodeId ].children
      , [ 'n1' ]
      )
    }
  )

  it ( 'should select block', ( assert ) => {
      assert.equal
      ( graph.blockId
      , 'b1' // graph2 blockId
      )
    }
  )

  it ( 'should add block', ( assert ) => {
      assert.equal
      ( graph.blocksById [ 'b1' ].name
      , 'foo'
      )
    }
  )

  it ( 'add new node in nodesById', ( assert ) => {
      assert.equal
      ( graph.nodesById [ 'n1' ]
      , { id: 'n1'
        , blockId: 'b1'
        , parent: rootNodeId
        , children: []
        }
      )
    }
  )

})

describe ( 'insertGraph', ( it, setupDone ) => {
  let main: GraphType
  let graph: GraphType
  let g1: GraphType
  let g2: GraphType

  Promise.all
  ( [ createGraph ( 'main', SOURCE_A )
      .then ( ( g ) => { graph = g } )
    , createGraph ( 'foo', SOURCE_A )
      .then ( ( g ) => { g1 = g } )
    , createGraph ( 'bar', SOURCE_A )
      .then ( ( g ) => { g2 = g } )
    ]
  )
  .then ( () => {
    main = graph
    graph = insertGraph ( graph, rootNodeId, 0, g1 )
    graph = insertGraph ( graph, rootNodeId, 0, g2 )
    setupDone ()
  })

  it ( 'insert child in parent', ( assert ) => {

      assert.equal
      ( graph.nodesById [ rootNodeId ].children
      , [ 'n2', 'n1' ]
      )
    }
  )

  // FIXME: What is this used for ?
  it ( 'should select block', ( assert ) => {
      assert.equal
      ( graph.blockId
      , 'b2' // g2 block id
      )
    }
  )

  it ( 'should insert null', ( assert ) => {
      let g = insertGraph ( main, rootNodeId, 1, g1 )
      assert.equal
      ( g.nodesById [ rootNodeId ].children
      , [ null, 'n1' ]
      )
    }
  )

  it ( 'should replace null', ( assert ) => {
      let g = insertGraph ( main, rootNodeId, 1, g1 )
      g = insertGraph ( g, rootNodeId, 0, g2 )

      assert.equal
      ( g.nodesById [ rootNodeId ].children
      , [ 'n2', 'n1' ]
      )
    }
  )

  it ( 'should add blocks', ( assert ) => {
      assert.equal
      ( Object.keys ( graph.blocksById ).sort ()
      , [ 'b0', 'b1', 'b2' ]
      )
    }
  )

  it ( 'should set child in nodesById', ( assert ) => {

      assert.equal
      ( graph.nodesById [ 'n1' ]
      , { blockId: 'b1'
        , id: 'n1'
        , parent: rootNodeId
        , children: []
        }
      )
    }
  )
})

describe ( 'GraphHelper.slip', ( it, setupDone ) => {

  let baz: GraphType
  let bong: GraphType
  let bar: GraphType
  let main: GraphType
  let mainfoo: GraphType
  let foo: GraphType
  const nid: any = {}

  Promise.all
  ( [ createGraph ( 'baz', SOURCE_A )
      .then ( ( g ) => { baz = g })
    , createGraph ( 'bong', SOURCE_A )
      .then ( ( g ) => { bong = g } )
    , createGraph ( 'bar', SOURCE_A )
      .then ( ( g ) => { bar = g } )
    , createGraph ()
      .then ( ( g ) => { main = g } )
    , createGraph ( 'foo', SOURCE_A )
      .then ( ( g ) => { foo = g } )
    ]
  )
  .then ( () => {
    bar = insertGraph ( bar, rootNodeId, 0, baz )
    bar = insertGraph ( bar, rootNodeId, 1, bong )

    main = insertGraph ( main, rootNodeId, 0, foo )
    mainfoo = main
    main = slipGraph ( main, rootNodeId, 0, bar )

    for ( const k in main.nodesById ) {
      const node = main.nodesById [ k ]
      const name = main.blocksById [ node.blockId ].name
      nid [ name ] = k
    }

    setupDone ()
  })

  // This graph has two objects and will be inserted in graph
  // between root and 'foo'
  // [ bar ]
  // [ baz ] [ bong ]

  // [ main ]
  // [ foo ]

  // [ main ]
  // [ bar ]
  // [ baz ] [ bong ]
  // [ foo ]

  it ( 'should select block', ( assert ) => {
    assert.equal ( main.blockId
    , main.nodesById [ nid.bar ].blockId
    )
  })

  it ( 'should set blocks', ( assert ) => {
    assert.equal ( traverse ( main )
    , [ 'n0:b0:main'
      , ' n2:b2:bar'
      , '  n3:b3:baz'
      , '   n1:b1:foo'
      , '  n4:b4:bong'
      ]
    )
  })

  it ( 'should not change blockId', ( assert ) => {
    const fooId = mainfoo.nodesById [ 'n1' ].blockId
    assert.equal ( 'foo', mainfoo.blocksById [ fooId ].name )
    assert.equal
    ( main.nodesById [ nid.foo ].blockId
    , fooId
    )
  })

  it ( 'should set child in parent', ( assert ) => {
    assert.equal ( main.nodesById [ rootNodeId ].children
    , [ nid.bar ]
    )
  })

  it ( 'should set previous child in new child', ( assert ) => {
    assert.equal ( main.nodesById [ nid.baz ].children
    , [ nid.foo ]
    )
  })

  it ( 'should set parent', ( assert ) => {
    assert.equal ( main.nodesById [ nid.foo ].parent
    , nid.baz
    )

    assert.equal ( main.nodesById [ nid.baz ].parent
    , nid.bar
    )

    assert.equal ( main.nodesById [ nid.bong ].parent
    , nid.bar
    )

    assert.equal ( main.nodesById [ nid.bar ].parent
    , rootNodeId
    )
  })

})

describe ( 'GraphHelper.cut', ( it, setupDone ) => {
  let main: GraphType
  let g1: GraphType
  let g2: GraphType

  Promise.all
  ( [ createGraph ()
      .then ( ( g ) => { main = g } )
    , createGraph ( 'g1', SOURCE_A )
      .then ( ( g ) => { g1 = g } )
    , createGraph ( 'g2', SOURCE_A )
      .then ( ( g ) => { g2 = g } )
    ]
  )
  .then ( () => {
    g1 = insertGraph ( g1, rootNodeId, 0, g2 )
    main = insertGraph ( main, rootNodeId, 1, g1 )
    // [ main ] 'n0'
    //   null  [ foo ] 'n1'
    //         [ bar ] 'n2'
    main = cutGraph ( main, 'n1' )
    // [ foo ]
    // [ bar ]
    setupDone ()
  })

  it ( 'create smaller graph', ( assert ) => {

    assert.equal
    ( Object.keys ( main.nodesById ).sort ()
    , [ 'n0', 'n1' ]
    )

    assert.equal
    ( traverse ( main )
    , [ 'n0:b1:g1'
      , ' n1:b2:g2'
      ]
    )
  })

  it ( 'should select block', ( assert ) => {
    assert.equal
    ( main.blockId
    , rootBlockId
    )
  })
})

describe ( 'dropGraph', ( it, setupDone ) => {
  let main: GraphType
  let main2: GraphType
  let main3: GraphType
  let foo: GraphType
  let bar: GraphType

  Promise.all
  ( [ createGraph ()
      .then ( ( g ) => { main = g } )
    , createGraph ( 'foo', SOURCE_A )
      .then ( ( g ) => { foo = g } )
    , createGraph ( 'bar', SOURCE_A )
      .then ( ( g ) => { bar = g } )
    ]
  )
  .then ( () => {
    main = insertGraph ( main, rootNodeId, 1, foo )
    const base = insertGraph ( main, rootNodeId, 2, bar )
    // [ graph ] 'n0'
    //   null  [ foo ] 'n1' [ bar ] 'n2'
    main = dropGraph ( base, 'n1' )
    // [ graph ] 'n0'
    //   null  null [ bar ] 'n1'
    main2 = dropGraph ( main, 'n1' )
    // [ graph ] 'n0'
    // ( no null )
    main3 = dropGraph ( base, 'n2' )
    // [ graph ] 'n0'
    //   null  [ foo ] 'n1'
    setupDone ()
  })

  it ( 'create smaller graph keeping blockId', ( assert ) => {
    assert.equal ( traverse ( main ), [ 'n0:b0:main', ' null', ' null', ' n1:b2:bar' ] )
  })

  it ( 'remove null', ( assert ) => {
    assert.equal ( traverse ( main2 ), [ 'n0:b0:main' ] )
    assert.equal ( traverse ( main3 ), [ 'n0:b0:main', ' null', ' n1:b1:foo' ] )
  })

  it ( 'should select block', ( assert ) => {
    assert.equal ( main.blockId, rootBlockId )
  })
})
