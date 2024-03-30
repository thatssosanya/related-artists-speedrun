// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import { MantineProvider, createTheme } from "@mantine/core"
import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import type { AppProps } from "next/app"

const theme = createTheme({})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme}>
      <Component {...pageProps} />
    </MantineProvider>
  )
}
