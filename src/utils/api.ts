/* eslint-disable no-console */
import axios from "axios"

import { PlayResponse, WinningPlayResponse } from "@/types/nextApi"
import { SpotifyArtist, SpotifyRelatedArtistsResponse } from "@/types/spotify"

export const getSpotifyAccessToken = async (): Promise<string> => {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify client ID or client secret.")
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: "grant_type=client_credentials",
  })

  if (response.ok) {
    const data = await response.json()

    return data.access_token
  } else {
    throw new Error(`Error retrieving access token: ${response.statusText}`)
  }
}

export const getSpotifyRelatedArtists = (artistId: string, token?: string) => {
  try {
    return (!token ? getSpotifyAccessToken() : Promise.resolve(token)).then((token) => {
      return axios
        .get<SpotifyRelatedArtistsResponse>(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((r) => r.data.artists)
    })
  } catch (error) {
    console.error("Error fetching related artists from Spotify: ", error)
    throw error
  }
}

export const spotifyArtistToArtist = (artist: SpotifyArtist) => {
  const spotifyName = artist.name
  const imageUrl = artist.images.reduce((closest, image) => {
    if (!closest) {
      return image
    }
    const closestDiff = Math.abs(closest.width - 300) + Math.abs(closest.height - 300)
    const currentDiff = Math.abs(image.width - 300) + Math.abs(image.height - 300)

    return currentDiff < closestDiff ? image : closest
  }).url

  return { id: artist.id, name: spotifyName, imageUrl }
}

export const playResponseIsWinning = (response: PlayResponse): response is WinningPlayResponse => {
  return response.status === "win"
}
