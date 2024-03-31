import { notifications } from "@mantine/notifications"

export const showErrorNotification = (props?: { message?: string; noAutoClose?: boolean }) => {
  const { message = "An error occurred", noAutoClose = false } = props ?? {}

  return notifications.show({
    color: "red",
    title: "Sorry bout that",
    message,
    autoClose: noAutoClose ? undefined : 3000,
  })
}
