/* global it expect describe jest */
import { mockComposition, mockRef } from './utils/testUtils'
import { caretSelection } from './utils/caretSelection'
import { doEnter } from './doEnter'

const composition = mockComposition ()
const position = { top: 0, left: 0 }

describe ( 'doEnter', () => {
  it ( 'splits to make new paragraph', () => {
    mockRef ()
    const selection = caretSelection
    ( [ 'mcneu', 'jnaid', 'zzvgp' ], 2, position )
    expect
    ( doEnter ( composition, selection ) )
    .toEqual
    ( [ { op: 'update', path: [ 'mcneu', 'jnaid', 'zzvgp' ]
        , value: { p: 1, t: 'B+I', i: 'li' }
        }
      , { op: 'delete', path: [ 'mcneu', 'mznao' ] }
      , { op: 'delete', path: [ 'mcneu', 'mnahl' ] }
      , { op: 'delete', path: [ 'mcneu', 'ncgow' ] }
      , { op: 'update', path: [ 'refe1' ]
        , value:
          { p: 0.5, t: 'P'
          , i:
            { refe2: 
              { p: 0, t: 'T', i: 'nk to view the next ' }
            , mnahl:
              { p: 1, t: 'I', i: 'page' }
            , ncgow:
              { p: 2, t: 'T', i: '.' }
            }
          }
        }
      , { op: 'select'
        , value: caretSelection ( [ 'refe1' ] , 0, position )
        }
      ]
    )
  })

  it ( 'creates new paragraph when selection at end', () => {
    mockRef ()
    const selection =
    caretSelection ( [ 'zhaog', 'haiou' ], 39, position )
    expect
    ( doEnter ( composition, selection ) )
    .toEqual
    ( [ { op: 'update', path: [ 'refe1' ]
        , value: { p: 1.5, t: 'P', i: '' }
        }
      , { op: 'select'
        , value: caretSelection ( [ 'refe1' ], 0, position )
        }
      ]
    )
  })

  it ( 'splits flat paragraph', () => {
    mockRef ()
    const selection = caretSelection ( [ 'zaahg' ], 11, position )
    expect
    ( doEnter ( composition, selection ) )
    .toEqual
    ( [ { op: 'update', path: [ 'zaahg' ]
        , value: { p: 2, t: 'P', i: 'This is the' }
        }
      , { op: 'update', path: [ 'refe1' ]
        , value: { p: 3, t: 'P', i: 'third paragraph. My tailor types fast.' }
        }
      , { op: 'select'
        , value: caretSelection ( [ 'refe1' ], 0, position )
        }
      ]
    )
  })
})
