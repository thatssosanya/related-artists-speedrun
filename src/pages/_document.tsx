import { ColorSchemeScript } from "@mantine/core"
import { Head, Html, Main, NextScript } from "next/document"

const Document = () => {
  return (
    <Html lang="en">
      <Head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </Head>
      <body>
        <main>
          <Main />
        </main>
        <NextScript />
      </body>
    </Html>
  )
}

export default Document
