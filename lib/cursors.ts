export interface Cursor {
  id: string
  name: string
  online: boolean
  index: number
  length: number
}

export enum CursorMessageType {
  CREATE,
  UPDATE_ONLINE,
  UPDATE_NAME,
  UPDATE_VALUE
}

export interface CursorMessage { 
  type: CursorMessageType
  id: string
}

export interface CursorNameMessage extends CursorMessage {
  type: CursorMessageType.UPDATE_NAME
  name: string
}

export interface CursorValueMessage extends CursorMessage {
  type: CursorMessageType.UPDATE_VALUE
  index: number
  length: number
}

export interface CursorCreateMessage extends CursorMessage {
  type: CursorMessageType.CREATE
  online: boolean
  name: string
  index: number
  length: number
}

export interface CursorOnlineMessage extends CursorMessage {
  type: CursorMessageType.UPDATE_ONLINE
  online: boolean
}