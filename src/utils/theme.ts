import { Container, createTheme } from "@mantine/core"
import clsx from "clsx"

import styles from "@/styles/Container.module.css"

const theme = createTheme({
  components: {
    Container: Container.extend({
      classNames: (_, { size }) => ({
        root: clsx({ [styles.responsiveContainer]: size === "responsive" }),
      }),
    }),
  },
})

export default theme
