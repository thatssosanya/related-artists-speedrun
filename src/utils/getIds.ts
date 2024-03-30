/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
require("dotenv").config({ path: "./.env.local" })

const namesArg = process.argv[2]

if (!namesArg) {
  console.error("Please provide the names array as a command-line argument.")
  process.exit(1)
}

let names: string[]
try {
  names = JSON.parse(namesArg)
} catch (error) {
  console.error("Invalid names array format. Please provide a valid JSON array.")
  process.exit(1)
}

const results: Record<string, string> = {}

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

async function searchArtists(names: string[]) {
  try {
    const token = await getAccessToken()

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
          const data = await response.json()
          const artist = data.artists.items[0]
          if (artist) {
            const spotifyName = artist.name
            console.log(`[${+i + 1}/${names.length}] ${name} -> ${spotifyName}: ${artist.id}`)
            results[spotifyName] = artist.id
          } else {
            console.log(`No artist found for name: ${name}`)
          }
        } else {
          console.error(`Error searching for artist: ${name}`, response.statusText)
        }

        // Add a 1-second delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error searching for artist: ${name}`, error)
      }
    }
  } catch (error) {
    console.error("Error retrieving access token:", error)
  }
}

searchArtists(names)
  .then(() => {
    console.log(results)
  })
  .catch((error) => {
    console.error("Error:", error)
  })
