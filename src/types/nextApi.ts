import { Artist } from "@prisma/client"

export type PlayRequest = null | { artist: Artist; sessionId: string; token: string }
export type NormalPlayResponse = {
  status: "play"
  relatedArtists: Array<Artist>
  startArtist?: Artist
  endArtist?: Artist
  sessionId?: string
  token?: string
}
export type WinningPlayResponse = { status: "win" }
export type PlayResponse = NormalPlayResponse | WinningPlayResponse

export type BulkCreateArtistsRequest = { artists: Array<Artist> }
export type BulkCreateArtistsResponse = { count: number }

export type SearchArtistsResponse = Array<Artist>
