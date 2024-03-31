import { Container } from "@mantine/core"

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container fluid p="sm">
      <Container size="responsive" p="40px 0px 10px">
        {children}
      </Container>
    </Container>
  )
}

export default DefaultLayout
