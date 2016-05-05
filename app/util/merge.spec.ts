/// <reference path="../../typings/jasmine/jasmine.d.ts" />
import { append, aset, insert, merge, remove, sort, update } from './merge.util'

describe
( 'IM.merge', () => {
    it ( 'should create new object'
    , () => {
        const a = {}
        const b = {}
        expect ( merge ( a, b ) )
        .not.toBe ( a )
        expect ( merge ( a, b ) )
        .not.toBe ( b )
      }
    )

    it ( 'should create frozen object'
    , () => {
        const a = merge ( { name: 'hello' }, {} )
        expect
        ( function () {
            a.name = 'hop'
          }
        )
        .toThrow ()
      }
    )

    it ( 'should merge new values'
    , () => {
        const a = { a: 3 }
        const b = { x: 1 }
        expect ( merge ( a, b ) )
        .toEqual ( { a: 3, x: 1 } )
      }
    )

    it ( 'should replace values'
    , () => {
        const a = { a: 3, x: 3 }
        const b = { x: 1 }
        expect ( merge ( a, b ) )
        .toEqual ( { a: 3, x: 1 } )
      }
    )

  }
)

describe
( 'IM.remove', () => {
    const a = { a: 3, b: { c: 4, d: 5 }, e: 6 }

    it ( 'should create new object'
    , () => {
        expect ( remove ( a, 'b' ) )
        .not.toBe ( a )
      }
    )

    it ( 'should create frozen object'
    , () => {
        const b = remove ( a, 'b' )
        expect
        ( function () {
            b.a = 34
          }
        )
        .toThrow ()
      }
    )

    it ( 'should delete value'
    , () => {
        expect ( remove ( a, 'b' ) )
        .toEqual ( { a: 3, e: 6 } )
      }
    )
  }
)

describe
( 'IM.append', () => {
    it ( 'should create new object'
    , () => {
        const a = [10]
        const b = 20
        expect ( append ( a, b ) )
        .not.toBe ( a )
      }
    )

    it ( 'should create frozen object'
    , () => {
        const a = append ( [], 1 )
        expect
        ( function () {
            a[0] = 100
          }
        )
        .toThrow ()
      }
    )

    it ( 'should append new values'
    , () => {
        const a = [10,20]
        const b = 30
        expect ( append ( a, b ) )
        .toEqual ( [ 10, 20, 30 ] )
      }
    )

    it ( 'should append and sort'
    , () => {
        const a = [10,20]
        const b = 15
        expect ( append ( a, b, ( a, b ) => a < b ? -1 : 1 ) )
        .toEqual ( [ 10, 15, 20 ] )
      }
    )
  }
)

describe
( 'IM.insert', () => {
    it ( 'should create new object'
    , () => {
        const a = [10]
        const b = 20
        expect ( insert ( a, 0, b ) )
        .not.toBe ( a )
      }
    )

    it ( 'should create frozen object'
    , () => {
        const a = insert ( [], 0, 1 )
        expect
        ( function () {
            a[0] = 100
          }
        )
        .toThrow ()
      }
    )

    it ( 'should insert new value'
    , () => {
        const a = [10,20]
        const b = 30
        expect ( insert ( a, 1, b ) )
        .toEqual ( [ 10, 30, 20 ] )
      }
    )
  }
)

describe
( 'IM.aset', () => {
    it ( 'should create new object'
    , () => {
        const a = [10]
        const b = 20
        expect ( aset ( a, 0, b ) )
        .not.toBe ( a )
      }
    )

    it ( 'should create frozen object'
    , () => {
        const a = aset ( [0], 0, 1 )
        expect
        ( function () {
            a[0] = 100
          }
        )
        .toThrow ()
      }
    )

    it ( 'should set new value'
    , () => {
        const a = [10,20]
        const b = 30
        expect ( aset ( a, 1, b ) )
        .toEqual ( [ 10, 30 ] )
      }
    )

    it ( 'should not set outside array'
    , () => {
        expect
        ( function () {
          const a = [10,20]
          const b = 30
          aset ( a, 3, b )
          }
        )
        .toThrow ()
      }
    )

    it ( 'should not set with neg indice'
    , () => {
        expect
        ( function () {
          const a = [10,20]
          const b = 30
          aset ( a, -1, b )
          }
        )
        .toThrow ()
      }
    )
  }
)

describe
( 'IM.update', () => {
  const a = { x: { y: 1 }, z: 2 }
  const b = { b: 'b' }

    it ( 'should create new object'
    , () => {
        expect ( update ( a, 'x', 'y', 3 ) )
        .not.toBe ( a )
      }
    )

    it ( 'should create frozen object'
    , () => {
        const c = update ( a, 'x', 'y', 3 )
        expect
        ( function () {
            c.x.y = 4
          }
        )
        .toThrow ()
      }
    )

    it ( 'should set new value'
    , () => {
        expect ( update ( a, 'x', 'y', 3 ) )
        .toEqual ( { x: { y: 3 }, z: 2 } )
      }
    )

    it ( 'should set new value with function'
    , () => {
        const a = { x: { y: { z: [ 1, 2 ] } }, w: 3 }
        const r =
        update ( a, 'x', 'y', 'z'
        , ( z ) => {
            return insert ( z, 1, 33 )
          }
        )
        expect ( r )
        .toEqual ( { x: { y: { z: [ 1, 33, 2 ] } }, w: 3 } )
      }
    )

    it ( 'should create required objects'
    , () => {
        expect ( update ( a, 'x', 'z', 'w', 3 ) )
        .toEqual ( { x: { y: 1, z: { w: 3 } }, z: 2 } )
      }
    )
  }
)

describe
( 'IM.sort', () => {
    const comp = ( a, b ) => a < b ? -1 : 1
    const a = [3, 4, 2]
    it ( 'should create new object'
    , () => {
        expect ( sort ( a, comp ) )
        .not.toBe ( a )
      }
    )

    it ( 'should create frozen object'
    , () => {
        const o = sort ( a, comp )
        expect
        ( function () {
            o[0] = 12
          }
        )
        .toThrow ()
      }
    )

    it ( 'should sort'
    , () => {
        expect ( sort ( a, comp ) )
        .toEqual ( [ 2, 3, 4 ] )
      }
    )
  }
)
