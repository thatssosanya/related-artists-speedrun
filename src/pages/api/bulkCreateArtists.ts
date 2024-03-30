/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"

const prisma = new PrismaClient()

interface ArtistInput {
  id: string
  name: string
  imageUrl: string
}

const validateArtistInput = (artist: any): artist is ArtistInput => {
  return (
    artist &&
    typeof artist.id === "string" &&
    artist.id.trim() !== "" &&
    typeof artist.name === "string" &&
    artist.name.trim() !== "" &&
    typeof artist.imageUrl === "string" &&
    artist.imageUrl.trim() !== ""
  )
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { artists } = req.body

    if (!Array.isArray(artists)) {
      return res.status(400).json({ error: "Invalid input. Expected an array of artists" })
    }

    const validArtists: ArtistInput[] = []
    const invalidArtists: any[] = []

    artists.forEach((artist) => {
      if (validateArtistInput(artist)) {
        validArtists.push(artist)
      } else {
        invalidArtists.push(artist)
      }
    })

    if (invalidArtists.length > 0) {
      return res.status(400).json({
        error: "Invalid input. Some artists have invalid fields",
        invalidArtists,
      })
    }

    try {
      const createdArtists = await prisma.artist.createMany({
        data: validArtists.map((artist) => ({
          id: artist.id,
          name: artist.name,
          imageUrl: artist.imageUrl,
        })),
        skipDuplicates: true,
      })

      res.status(200).json({ count: createdArtists.count })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal server error" })
    }
  } else {
    res.status(405).json({ error: "Method not allowed. Use POST" })
  }
}

export default handler
