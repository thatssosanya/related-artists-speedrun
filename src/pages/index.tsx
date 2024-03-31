import { useCallback, useMemo, useState } from "react"
import { FaArrowRight } from "react-icons/fa6"
import { HiRefresh } from "react-icons/hi"

import { Button, Center, Container, Group, Paper, Stack, Text, Title } from "@mantine/core"
import { Artist } from "@prisma/client"
import confetti from "canvas-confetti"
import _ from "lodash"
import Head from "next/head"
import Image from "next/image"

import DefaultLayout from "@/components/DefaultLayout"

import usePostPlay from "@/hooks/apiHooks/usePostPlay"
import useTimer from "@/hooks/useTimer"
import { playResponseIsWinning } from "@/utils/api"
import { showErrorNotification } from "@/utils/notifications"

const Play = () => {
  const [status, setStatus] = useState(initialStatus)
  const [parameters, setParameters] = useState(initialParameters)
  const [guesses, setGuesses] = useState(initialGuesses)
  const [endArtist, setEndArtist] = useState<Artist>()

  const [postPlay, { isLoading: isPostPlayLoading, isFetching: isPostPlayFetching }] = usePostPlay()
  const isPostPlayLoadingOrFetching = useMemo(
    () => isPostPlayLoading || isPostPlayFetching,
    [isPostPlayFetching, isPostPlayLoading],
  )

  const { formattedTime, reset: resetTimer } = useTimer({
    pause: status === "new" || status === "win" || isPostPlayLoading || isPostPlayFetching,
  })

  const resetState = useCallback(() => {
    setStatus(initialStatus)
    setParameters(initialParameters)
    setGuesses(initialGuesses)
    resetTimer()
  }, [resetTimer])

  const handleStart = useCallback(() => {
    postPlay(null).then((response) => {
      setStatus(response.status)

      try {
        if (!playResponseIsWinning(response)) {
          if (response.startArtist && response.endArtist && response.relatedArtists) {
            setEndArtist(response.endArtist)
            setGuesses([{ artist: response.startArtist, relatedArtists: response.relatedArtists }])
          } else {
            showErrorNotification({
              message: "Did not receive artists from the server",
            })

            return resetState()
          }
          if (response.sessionId && response.token) {
            setParameters({ sessionId: response.sessionId, token: response.token })
          } else {
            showErrorNotification({
              message: "Did not receive session data from the server",
            })

            return resetState()
          }
        }
      } catch {
        showErrorNotification()

        return resetState()
      }
    })
  }, [postPlay, resetState])

  const handlePlay = useCallback(
    (artist: Artist) => {
      postPlay({ artist, ...parameters! }).then((response) => {
        setStatus(response.status)

        try {
          if (playResponseIsWinning(response)) {
            setGuesses((prev) => [...prev, { artist: findPickedArtist(prev, artist.id)!, relatedArtists: [] }])

            return confetti(confettiOptions)
          } else if (response.relatedArtists) {
            setGuesses((prev) => [
              ...prev,
              {
                artist: findPickedArtist(prev, artist.id)!,
                relatedArtists: response.relatedArtists,
              },
            ])
          } else {
            showErrorNotification({
              message: "Did not receive artists from the server",
            })

            return resetState()
          }
        } catch {
          showErrorNotification()

          return resetState()
        }
      })
    },
    [parameters, postPlay, resetState],
  )

  return (
    <>
      <Head>
        <title>Related Artists Speedrun</title>
      </Head>
      <DefaultLayout>
        <Paper bg="gray.8" p="lg" radius="xl" shadow="xl">
          <Stack gap="40px">
            <Container>
              <Paper color="gray.9" shadow="md" p="sm">
                <Title order={1}>{formattedTime}</Title>
              </Paper>
            </Container>
            {status === "new" && (
              <Container>
                <Button size="xl" color="green" onClick={() => handleStart()} loading={isPostPlayLoadingOrFetching}>
                  Start
                </Button>
              </Container>
            )}
            {status === "win" && (
              <Container>
                <Button size="xl" color="green" onClick={() => resetState()} loading={isPostPlayLoadingOrFetching}>
                  Play again
                </Button>
              </Container>
            )}
            {status === "play" && (
              <Paper bg="gray.9" p="lg" radius="lg" shadow="xl">
                <Stack gap="xl">
                  {guesses.length && endArtist && (
                    <Container>
                      <Stack gap="sm">
                        <Center>
                          <Paper bg="gray.8" shadow="md" p="md">
                            <Title order={1}>Related artists for {guesses[guesses.length - 1].artist.name}</Title>
                          </Paper>
                        </Center>
                        <Center>
                          <Paper bg="gray.8" shadow="md" p="sm">
                            <Title order={3}>Find a path to {endArtist.name}</Title>
                          </Paper>
                        </Center>
                      </Stack>
                    </Container>
                  )}
                  <Group gap="lg" justify="center">
                    {guesses.length
                      ? guesses[guesses.length - 1].relatedArtists.map((artist) => (
                          <ArtistCard
                            artist={artist}
                            onClick={(artist) => handlePlay(artist)}
                            type="current"
                            loading={isPostPlayLoadingOrFetching}
                            key={artist.id}
                          />
                        ))
                      : undefined}
                  </Group>
                </Stack>
              </Paper>
            )}
            {(status === "play" || status === "win") && (
              <Paper bg="gray.9" p="lg" radius="lg" shadow="xl">
                <Group gap="lg" justify="center" align="stretch">
                  {guesses
                    .map(({ artist }) => artist)
                    .reduce((a, artist, i) => {
                      const element: React.ReactNode = (
                        <ArtistCard
                          artist={artist}
                          onClick={() => setGuesses((prev) => prev.slice(0, i + 1))}
                          type="previous"
                          noButton={guesses.length === 1 || i === guesses.length - 1}
                          loading={isPostPlayLoadingOrFetching}
                          winner={artist.id === endArtist?.id}
                          key={artist.id}
                        />
                      )
                      if (i === 0) {
                        return [...a, element]
                      }

                      return [
                        ...a,
                        <Stack justify="flex-end" pb="lg" key={"arrowTo" + artist.id}>
                          <FaArrowRight size={24} />
                        </Stack>,
                        element,
                      ]
                    }, [] as React.ReactNode[])}
                  {status === "play" && (
                    <>
                      <Stack justify="flex-end" pb="lg">
                        <Title order={1}>...</Title>
                      </Stack>
                      {endArtist && <ArtistCard artist={endArtist} onClick={_.noop} type="previous" noButton />}
                    </>
                  )}
                </Group>
              </Paper>
            )}
            {status === "play" && (
              <Container>
                <Button variant="subtle" onClick={resetState}>
                  Reset session
                </Button>
              </Container>
            )}
          </Stack>
        </Paper>
      </DefaultLayout>
    </>
  )
}

type GuessState = { artist: Artist; relatedArtists: Artist[] }

const initialStatus = "new" as "new" | "play" | "win",
  initialParameters = null as { sessionId: string; token: string } | null,
  initialGuesses = [] as GuessState[]

const findPickedArtist = (state: GuessState[], artistId: string) =>
  state
    .map((guess) => guess.relatedArtists)
    .flat()
    .find((artist) => artist.id === artistId)

const ArtistCard = ({
  artist,
  onClick,
  type,
  loading,
  winner,
  noButton,
}: {
  artist: Artist
  onClick: (artist: Artist) => void
  type: "current" | "previous"
  loading?: boolean
  winner?: boolean
  noButton?: boolean
}) => {
  return (
    <Paper bg={winner ? "green" : "gray.8"} radius="md" shadow="md" p="md" key={artist.id}>
      <Stack gap="md" align="center">
        <ArtistImage url={artist.imageUrl} alt={artist.name} />
        {type === "current" ? (
          <Button color="green" onClick={() => onClick(artist)} loading={loading}>
            {artist.name}
          </Button>
        ) : noButton ? (
          <Button variant="subtle" disabled>
            <Text c="white">{artist.name}</Text>
          </Button>
        ) : (
          <Button leftSection={<HiRefresh />} onClick={() => onClick(artist)} loading={loading}>
            {artist.name}
          </Button>
        )}
      </Stack>
    </Paper>
  )
}

const ArtistImage = ({ url, alt }: { url: string; alt: string }) => {
  return <Image src={url} width="120" height="120" alt={alt} />
}

const confettiOptions = {
  origin: {
    y: 0.9,
  },
  gravity: 1.5,
  ticks: 100,
  spread: 180,
  particleCount: 500,
  startVelocity: 75,
  disableForReducedMotion: true,
}

export default Play
