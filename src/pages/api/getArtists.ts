/* eslint-disable @typescript-eslint/naming-convention */

/* eslint-disable no-console */
import { NextApiRequest, NextApiResponse } from "next"

import { Artist, SpotifySearchResponse } from "@/types/spotify"
import { CouldError } from "@/types/util"

const handler = async (req: NextApiRequest, res: NextApiResponse<CouldError<Artist[]>>) => {
  if (req.method === "POST") {
    const { names } = req.body

    if (!Array.isArray(names) || names.some((name) => typeof name !== "string")) {
      res.status(400).json({ error: "Invalid request body. 'names' must be an array of strings." })

      return
    }

    try {
      const artists = await searchArtists(names)
      res.status(200).json(artists)
    } catch (error) {
      console.error("Error searching for artists: ", error)
      res.status(500).json({ error: "An error occurred while searching for artists." })
    }
  } else {
    res.status(405).json({ error: "Method not allowed. Only POST requests are accepted." })
  }
}

async function searchArtists(names: string[]): Promise<Artist[]> {
  const token = await getAccessToken()
  const results: Artist[] = []

  for (const [i, name] of Object.entries(names)) {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        const data = (await response.json()) as SpotifySearchResponse
        const artist = data.artists.items[0]
        if (artist) {
          const spotifyName = artist.name
          const imageUrl = artist.images.reduce((closest, image) => {
            if (!closest) {
              return image
            }
            const closestDiff = Math.abs(closest.width - 300) + Math.abs(closest.height - 300)
            const currentDiff = Math.abs(image.width - 300) + Math.abs(image.height - 300)

            return currentDiff < closestDiff ? image : closest
          }).url
          console.log(`[${+i + 1}/${names.length}] ${name} -> ${spotifyName}: ${artist.id}`)
          results.push({ id: artist.id, name: spotifyName, imageUrl })
        } else {
          console.log(`No artist found for name: ${name}`)
        }
      } else {
        console.error(`Error searching for artist: ${name}`, response.statusText)
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Error searching for artist: ${name}`, error)
    }
  }

  return results
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify client ID or client secret.")
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
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

export default handler
