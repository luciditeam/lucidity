import { GraphType } from '../Graph'
import { SlotType } from './SlotType'
import { ScrubCode } from '../Code'
import { StringMap } from '../..'

export interface BlockTypeChanges {
  name?: string
  source?: string
}

// extra file name
export const extraSourceRe = /^(.+)\.([^\.]+)$/


export interface PlaybackMetaType {
  // context changes
  expect?: StringMap
  // one for each slot
  provide?: StringMap
  all?: boolean // set to true if children: 'all'
  isvoid?: boolean // set to true if it has an update but not type for update
  children?: string[]
  update?: string // normalized type
}

export interface SourceCode {
  source: string
}

export interface CompiledCode {
  js?: string
  scrub?: ScrubCode
  meta?: PlaybackMetaType
}

interface MMap<T> {
  [ key: string ]: T
}

export interface BlockSourceInfo extends CompiledCode {
  // Extra compilation information.
  compiled?: MMap<CompiledCode>
}

export interface BlockType extends BlockSourceInfo {
  id: string
  name: string
  source: string
  // Extra file sources
  sources?: StringMap
}

export interface BlockByIdType {
  [ id: string ]: BlockType
}

export interface BlockAddOperationType {
  pos: number
  parentId: string
  ownerType: string
  componentId?: string
}

// basic compiler type checks
const typetest = function
( a: BlockType ) : BlockTypeChanges {
  return a
}

export const nextBlockId =
( blocksById: BlockByIdType
) : string => {
  let n : number = 0
  while ( blocksById [ `b${n}` ] ) {
    n += 1
  }
  return `b${n}`
}

export const rootBlockId = nextBlockId ( {} )
