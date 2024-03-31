/* eslint-disable no-console */
import { Artist, PrismaClient } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"

import { PlayRequest, PlayResponse } from "@/types/nextApi"
import { CouldError } from "@/types/util"
import { getSpotifyAccessToken, getSpotifyRelatedArtists, spotifyArtistToArtist } from "@/utils/api"

const prisma = new PrismaClient()

async function getRelatedArtists(artistId: string, token: string) {
  const spotifyArtists = await getSpotifyRelatedArtists(artistId, token)
  const artists = spotifyArtists.map(spotifyArtistToArtist)

  return artists
}

const handler = async (req: NextApiRequest, res: NextApiResponse<CouldError<PlayResponse>>) => {
  if (req.method === "POST") {
    const body = req.body as PlayRequest

    if (["artist", "sessionId", "token"].every((k) => !(k in body!))) {
      try {
        // 2 unique random artists to start and end with
        const [startArtist, endArtist] = await prisma.$queryRawUnsafe<Artist[]>(
          `SELECT * FROM "Artist" ORDER BY RANDOM() LIMIT 2;`,
        )

        if (!startArtist || !endArtist) {
          throw new Error("Couldn't find two artists to start and end with")
        }

        const sessionPromise = prisma.session.create({
          data: {
            startArtistId: startArtist.id,
            endArtistId: endArtist.id,
          },
        })

        const token = await getSpotifyAccessToken()
        const relatedArtistsPromise = getRelatedArtists(startArtist.id, token)

        const [session, relatedArtists] = await Promise.all([sessionPromise, relatedArtistsPromise])

        prisma.play.create({
          data: {
            sessionId: session.id,
            artistId: startArtist.id,
            relatedArtistIds: relatedArtists.map((artist) => artist.id),
          },
        })

        res.status(200).json({
          status: "play",
          startArtist,
          endArtist,
          relatedArtists,
          sessionId: session.id,
          token: token,
        })
      } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
      }
    } else {
      const { artist, sessionId, token: userToken } = body!

      try {
        if (!sessionId) {
          throw new Error("Missing sessionId in request body")
        }

        const session = await prisma.session.findUnique({ where: { id: sessionId } })

        if (!session) {
          throw new Error("Invalid sessionId")
        }

        prisma.play.create({
          data: {
            session: {
              connect: {
                id: sessionId,
              },
            },
            artist: {
              connectOrCreate: {
                where: { id: artist.id },
                create: artist,
              },
            },
          },
          include: {
            artist: true,
          },
        })

        if (artist.id === session.endArtistId) {
          res.status(200).json({ status: "win" })
        } else {
          const token = userToken ?? (await getSpotifyAccessToken())
          const relatedArtists = await getRelatedArtists(artist.id, token)

          res.status(200).json({ status: "play", relatedArtists })
        }
      } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
      }
    }
  } else {
    res.status(405).json({ message: "Method not allowed. Use POST" })
  }
}

export default handler
