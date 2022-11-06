export interface Board {
  key: string
  data: {
    blocks: []
    version: string
    time: number
  }
  meta: {
    name: string
    stamp: number
    cover: string
    coverBg: object
  }
}

export interface BoardStatus {
  id: string
  status: string
}
