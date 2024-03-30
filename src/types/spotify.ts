export interface SpotifyArtist {
  external_urls: {
    spotify: string
  }
  followers: {
    href: string | null
    total: number
  }
  genres: Array<string>
  href: string
  id: string
  images: Array<{
    height: number
    url: string
    width: number
  }>
  name: string
  popularity: number
  type: "artist"
  uri: string
}

export interface SpotifyArtistSearchResponse {
  artists: {
    href: string
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
    items: Array<SpotifyArtist>
  }
}

export interface SpotifyRelatedArtistsResponse {
  artists: Array<SpotifyArtist>
}
