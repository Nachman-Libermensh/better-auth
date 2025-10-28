"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"

type ActionButtonProps = React.ComponentProps<typeof Button> & {
  confirm?: boolean
  confirmMessage?: string
  loading?: boolean
}

function isPromise<T>(value: unknown): value is PromiseLike<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof (value as { then?: unknown }).then === "function"
  )
}

const ActionButton = ({
  children,
  confirm = false,
  confirmMessage = "האם לבצע פעולה זו?",
  loading,
  onClick,
  disabled,
  ...buttonProps
}: ActionButtonProps) => {
  const [internalLoading, setInternalLoading] = React.useState(false)
  const isMountedRef = React.useRef(true)

  const { type = "button", ...restProps } = buttonProps

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const isLoading = loading ?? internalLoading

  const handleAction = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) {
        return
      }

      const result = onClick?.(event)

      if (loading === undefined && isPromise(result)) {
        if (isMountedRef.current) {
          setInternalLoading(true)
        }

        try {
          await result
        } finally {
          if (isMountedRef.current) {
            setInternalLoading(false)
          }
        }
      }

      return result
    },
    [disabled, isLoading, loading, onClick]
  )

  const content = (
    <>
      {isLoading && <Spinner aria-hidden="true" className="size-4" />}
      {children}
    </>
  )

  if (!confirm) {
    return (
      <Button
        aria-busy={isLoading}
        data-state={isLoading ? "loading" : undefined}
        disabled={disabled || isLoading}
        onClick={handleAction}
        type={type}
        {...restProps}
      >
        {content}
      </Button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          aria-busy={isLoading}
          data-state={isLoading ? "loading" : undefined}
          disabled={disabled || isLoading}
          type={type}
          {...restProps}
        >
          {content}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>אישור פעולה</AlertDialogTitle>
          <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} type="button">
            ביטול
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={handleAction}
            type="button"
          >
            {isLoading && <Spinner aria-hidden="true" className="size-4" />}
            אישור
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

ActionButton.displayName = "ActionButton"

export { ActionButton }
