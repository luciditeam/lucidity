const getVerb = ( doc ) => (
  doc._deleted ?
  'Deleted'
  : ( doc._rev.split('-')[0] === '1' ?
      'New'
      : 'Updated'
    )
)

// Could be removed: no need for so much operation noise or have something
// more interesting...
const getStatus = ( doc ) => (
  { type: 'info', message: `${ getVerb ( doc )} ${doc.type} '${doc.title || ''}'` }
)

export const update =
( { state, input: { change }, output } ) => {
  const doc = change.doc
  const { _id, type } = doc

  const status = type === 'main' ? undefined : getStatus ( doc )
  let saved

  const cid = state.get ( [ type, '_id' ] )

  if ( doc._deleted ) {
    state.unset ( [ 'data', type, _id ] )
    if ( _id === cid ) {
      state.unset ( [ type ] )
      // should load a new item in place
    }
  }
  else {
    state.set ( [ 'data', type, _id ], doc )

    if ( type === 'main' ) { // selecting element
      const editing = state.get ( [ '$factory', 'editing' ] )
      if ( editing === _id ) {
        // the _id in 'select' == type
        // when editing == type on select, activate title edit
        state.set ( [ '$factory', 'editing' ], `${_id}-title` )
      }
    }
    else {
      if ( _id === cid || cid === undefined ) {
        saved = type
      }
    }
  }
  output ( { saved, status } )
}
