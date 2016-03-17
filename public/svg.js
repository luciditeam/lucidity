const RADIUS = 5
const SLOT   = 5
const SPAD   = 16
const HEIGHT = 30
const TPAD   = 10
const GRIDH  = 8

/** Compute the minimum size to display the element.
 *
 * @param {Snap} s snap svg drawer
 * @param {object} obj object definition
 * @returns {void}
 */
export function computeMinSize ( s, obj ) {
  const downSlots = ( obj.down || [] ).length
  const upSlots   = ( obj.up   || [] ).length

  const t = s.text ( 0, 0, obj.name )
  t.addClass ( 'tbox' )
  const tb = t.getBBox ()
  t.remove ()

  let w  = tb.width + 2 * TPAD
  const wd = RADIUS + downSlots * ( SPAD + 2 * SLOT ) + SPAD + RADIUS
  const wu = RADIUS + upSlots   * ( SPAD + 2 * SLOT ) + SPAD + RADIUS

  w = Math.ceil ( Math.max ( w, wd, wu ) / GRIDH ) * GRIDH

  return { w
         , h: HEIGHT
         , wd
         , wu
         , tw: tb.width
         , th: tb.height
         }
}

/** Create a box with up and down slots.
 * The sizes have to be computed first in the 'info' field.
 * FIXME: this function needs a better interface.
 *
 * @param {Snap} s snap svg drawer
 * @param {string} txt name to display in box
 * @param {object} pos x and y coordinates of top-left corner
 * @param {object} info junk field
 * @param {int} pal palette id number [1,12]
 * @param {int} upSlots number of up slots
 * @param {int} downSlots number of down slots
 * @returns {void}
 */
export function makeBox ( s, txt, pos, info, pal, upSlots, downSlots ) {
  const sextra = info.sextra
  const sz     = info.size
  const w  = sz.w
  const wd = sz.wd
  const wu = sz.wu
  const h = sz.h
  const r = RADIUS

  /*
  w *= 2
  h *= 2
  r *= 2
  */

  // path starts at top-left corner + RADIUS in pos.x direction.
  const path = [ `M${pos.x + r} ${pos.y}` ]

  for ( let i = 0; i < upSlots; i += 1 ) {
    path.push ( `h${SPAD}` )
    path.push ( `l${SLOT} ${-SLOT}` )
    path.push ( `l${SLOT} ${ SLOT}` )
  }

  const rpadu = w - wu
  if ( rpadu > 0 ) {
    path.push ( `h${ rpadu + SPAD }` )
  }
  else {
    path.push ( `h${ SPAD }` )
  }

  // SPAD   /\  SPAD  /\
  // +-----+  +------+  +--

  path.push ( `a${r} ${r} 0 0 1 ${ r} ${ r}` )

  path.push ( `v${ h - 2 * r }`      )

  path.push ( `a${r} ${r} 0 0 1 ${-r} ${ r}` )

  const rpadd = w - wd
  if ( rpadd > 0 ) {
    path.push ( `h${ -rpadd - SPAD }` )
  }
  else {
    path.push ( `h${ -SPAD }` )
  }

  for ( let i = downSlots - 1; i >= 0; i -= 1 ) {
    path.push ( `l${ -SLOT } ${ -SLOT }` )
    path.push ( `l${ -SLOT } ${  SLOT }` )
    path.push ( `h${ -SPAD - ( sextra [ i ] || 0 ) }` )
  }

  path.push ( `a${r} ${r} 0 0 1 ${-r} ${-r}` )

  path.push ( `v${ -h + 2 * r }`    )
  path.push ( `a${r} ${r} 0 0 1 ${ r} ${-r}` )

  // path.push ( `a50 50 0 0 1 50 50` )
  // path.push ( `l50 50` )

  const box = s.path ( path.join ( ' ' ) )
  box.addClass ( `box${pal}` )

  const rb = box.getBBox ()

  const t = s.text
  ( pos.x + TPAD
  , rb.y + rb.height / 2 + sz.th / 4
  , txt
  )

  t.addClass ( 'tbox' )

  if ( info.tclass ) {
    t.addClass ( info.tclass )
  }
}
