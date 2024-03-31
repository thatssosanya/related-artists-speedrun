import { MantineProvider } from "@mantine/core"
import "@mantine/core/styles.css"
import { Notifications } from "@mantine/notifications"
import "@mantine/notifications/styles.css"
import type { AppProps } from "next/app"

import theme from "@/utils/theme"

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications />
      <main>
        <Component {...pageProps} />
      </main>
    </MantineProvider>
  )
}

export default App
