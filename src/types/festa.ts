export type PartyStatus = {
  registrationOpen: boolean
  votingOpen: boolean
  votingEnded: boolean
}

export type Costume = {
  id: string
  name: string
  costume: string
  isMine?: boolean
}

export type RegisterCostumeResult = {
  costume: Costume
  alreadyRegistered: boolean
}

export type CostumesResult = {
  costumes: Costume[]
  myCostumeId: string | null
  hasVoted: boolean
  votingOpen: boolean
  votingEnded: boolean
  registrationOpen: boolean
}

export type RankingEntry = {
  position: number
  id: string
  name: string
  costume: string
  votes: number
}

export type RankingResult = {
  ranking: RankingEntry[]
  totalVotes: number
  totalCostumes: number
  status: PartyStatus
}

export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiError = {
  success: false
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
