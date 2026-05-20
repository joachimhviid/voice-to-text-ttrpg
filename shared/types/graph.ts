export type CharacterNode = {
  id: number
  imageUrl: string
  name: string
  wikiId?: number
}

export type CharacterEdge = {
  character1Id: number
  character2Id: number
  id: number
  score: number
  sessionId?: null | string
}

export type SimulationNode = CharacterNode & {
  vx: number
  vy: number
  x: number
  y: number
}
