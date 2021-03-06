// FIXME: replace this with an import
declare var global: any

export default function setSelection ( node, stringPath: string ) {
  const selection = global.selection
  if ( node && selection && stringPath === selection.stringPath ) {
    const textNode = node.childNodes [ 0 ]
    const range = document.createRange ()
    range.setStart(textNode, selection.anchorOffset )
    if ( selection.type === 'Range' ) {
      // Should use focusPath here...
      range.setEnd ( textNode, selection.focusOffset )
    }

    const sel = window.getSelection ()
    sel.removeAllRanges ()
    sel.addRange ( range )
    global.selection = null
  }
}
