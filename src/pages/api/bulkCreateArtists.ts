/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"

import { BulkCreateArtistsRequest, BulkCreateArtistsResponse } from "@/types/nextApi"
import { CouldError } from "@/types/util"

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

const handler = async (req: NextApiRequest, res: NextApiResponse<CouldError<BulkCreateArtistsResponse>>) => {
  if (req.method === "POST") {
    const { artists } = req.body as BulkCreateArtistsRequest

    if (!Array.isArray(artists)) {
      return res.status(400).json({ message: "Invalid input. Expected an array of artists" })
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
        message: `Invalid input. ${invalidArtists.length} artists have invalid fields: ${invalidArtists.map((artist) => artist.name ?? "ID " + artist.id).join(", ")}`,
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
      res.status(500).json({ message: "Internal server error" })
    }
  } else {
    res.status(405).json({ message: "Method not allowed. Use POST" })
  }
}

export default handler
