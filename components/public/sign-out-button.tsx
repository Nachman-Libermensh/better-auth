"use client"

import { useRouter } from "next/navigation"
import React from "react"

import { ActionButton } from "@/components/public/action-button"
import { authClient } from "@/lib/auth-client"

type SignOutButtonProps = {
  text?: string
} & React.ComponentProps<typeof ActionButton>

const SignOutButton = ({
  text,
  confirm = true,
  confirmMessage = "האם אתה בטוח שברצונך להתנתק?",
  onClick,
  ...props
}: SignOutButtonProps) => {
  const router = useRouter()

  const handleSignOut = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        const result = onClick(event)

        if (result && typeof (result as PromiseLike<unknown>).then === "function") {
          await result
        }
      }

      return authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login")
          },
        },
      })
    },
    [onClick, router]
  )

  return (
    <ActionButton
      confirm={confirm}
      confirmMessage={confirmMessage}
      onClick={handleSignOut}
      {...props}
    >
      {text ?? "התנתק"}
    </ActionButton>
  )
}

export default SignOutButton
