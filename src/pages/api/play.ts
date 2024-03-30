/* eslint-disable no-console */
import { Artist, PrismaClient } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"

import { getSpotifyAccessToken, getSpotifyRelatedArtists } from "@/utils/api"

const prisma = new PrismaClient()

async function getRelatedArtists(artistId: string, token: string) {
  const dbPromise = prisma.artist
    .findFirst({ where: { id: artistId }, include: { relatedArtists: true } })
    .then((r) => r?.relatedArtists ?? [])

  const { getSpotifyRelatedArtistsPromise, cancelGetSpotifyRelatedArtistsPromise } = getSpotifyRelatedArtists(
    artistId,
    token,
  )

  const { artists: fasterArtists, source } = await Promise.race([
    dbPromise.then((artists) => ({ artists, source: "db" })),
    getSpotifyRelatedArtistsPromise.then((artists) => ({ artists, source: "spotify" })),
  ])

  if (source === "db" && fasterArtists.length > 0) {
    // If db returns first and has data, cancel the Spotify request and return db data
    cancelGetSpotifyRelatedArtistsPromise()

    return fasterArtists
  } else {
    const spotifyArtists = await getSpotifyRelatedArtistsPromise
    // If Spotify returns first or db doesn't have data, save Spotify data to db and return it
    await prisma.artist.update({
      where: { id: artistId },
      data: { relatedArtists: { set: spotifyArtists } },
    })

    return spotifyArtists
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { artist, sessionId, token: userToken } = req.body

    if (!artist || !sessionId) {
      try {
        // Create a new Session with random starting artist and end artist
        const [startArtist, endArtist] = await prisma.$queryRawUnsafe<Artist[]>(
          `SELECT * FROM "Artist" ORDER BY RANDOM() LIMIT 2;`,
        )

        if (!startArtist || !endArtist) {
          throw new Error("Couldn't find two artists to start and end with")
        }

        const session = await prisma.session.create({
          data: {
            startArtistId: startArtist.id,
            endArtistId: endArtist.id,
          },
        })

        await prisma.play.create({
          data: {
            sessionId: session.id,
            artistId: startArtist.id,
          },
        })

        const token = await getSpotifyAccessToken()
        const relatedArtists = await getRelatedArtists(startArtist.id, token)

        res.status(200).json({ status: "play", relatedArtists, token: token })
      } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal server error" })
      }
    } else {
      try {
        if (!sessionId) {
          throw new Error("Missing sessionId in request body")
        }

        const session = await prisma.session.findUnique({ where: { id: sessionId } })

        if (!session) {
          throw new Error("Invalid sessionId")
        }

        await prisma.play.create({
          data: {
            sessionId,
            artistId: artist,
          },
        })

        if (artist === session.endArtistId) {
          res.status(200).json({ status: "win" })
        } else {
          const token = userToken ?? (await getSpotifyAccessToken())
          const relatedArtists = await getRelatedArtists(artist, token)

          res.status(200).json({ status: "play", relatedArtists })
        }
      } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal server error" })
      }
    }
  } else {
    res.status(405).json({ error: "Method not allowed. Use POST" })
  }
}

export default handler
