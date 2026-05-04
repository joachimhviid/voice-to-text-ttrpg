export type CharacterNode = {
  id: number
  name: string
  imageUrl: string
  wikiId?: number
}

export type CharacterEdge = {
  id: number
  character1Id: number
  character2Id: number
  score: number
  sessionId?: string | null
}

export type SimulationNode = CharacterNode & {
  x: number
  y: number
  vx: number
  vy: number
}
