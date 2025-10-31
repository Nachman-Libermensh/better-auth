"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CalendarProps = React.ComponentProps<typeof Calendar>
type CaptionLayout = NonNullable<CalendarProps["captionLayout"]>

type CaptionLayoutOption = {
  value: CaptionLayout
  label: React.ReactNode
}

const DEFAULT_CAPTION_LAYOUT_OPTIONS: CaptionLayoutOption[] = [
  { value: "dropdown", label: "Month and year" },
  { value: "dropdown-months", label: "Month" },
  { value: "dropdown-years", label: "Year" },
  { value: "label", label: "Static caption" },
]

interface DatePickerProps
  extends Omit<CalendarProps, "captionLayout" | "className"> {
  /**
   * Controls the caption layout of the underlying calendar when the component is used as a controlled input.
   */
  captionLayout?: CaptionLayout
  /**
   * Sets the initial caption layout for the calendar when the component is used in an uncontrolled manner.
   */
  defaultCaptionLayout?: CaptionLayout
  /**
   * Called whenever the caption layout changes via the selection control.
   */
  onCaptionLayoutChange?: (layout: CaptionLayout) => void
  /**
   * Determines whether to render the caption layout selector underneath the calendar.
   */
  showCaptionLayoutSelect?: boolean
  /**
   * Custom label text rendered above the caption layout selector. Set to `null` to hide the label entirely.
   */
  captionLayoutLabel?: React.ReactNode | null
  /**
   * Customizes the available caption layout options in the selector.
   */
  captionLayoutOptions?: CaptionLayoutOption[]
  /**
   * Placeholder rendered inside the caption layout selector.
   */
  selectPlaceholder?: React.ReactNode
  /**
   * Additional props passed to the select root element.
   */
  selectProps?: Omit<React.ComponentProps<typeof Select>, "value" | "onValueChange" | "defaultValue">
  /**
   * Additional props passed to the select trigger element.
   */
  selectTriggerProps?: React.ComponentProps<typeof SelectTrigger>
  /**
   * Additional props passed to the select content element.
   */
  selectContentProps?: React.ComponentProps<typeof SelectContent>
  /**
   * Additional props passed to the caption layout label element.
   */
  labelProps?: React.ComponentProps<typeof Label>
  /**
   * Additional class names applied to the root element that wraps the calendar and the selector.
   */
  className?: string
  /**
   * Additional class names applied directly to the calendar component.
   */
  calendarClassName?: string
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      captionLayout,
      defaultCaptionLayout = "dropdown",
      onCaptionLayoutChange,
      showCaptionLayoutSelect = true,
      captionLayoutLabel = "Caption layout",
      captionLayoutOptions = DEFAULT_CAPTION_LAYOUT_OPTIONS,
      selectPlaceholder,
      selectProps,
      selectTriggerProps,
      selectContentProps,
      labelProps,
      className,
      calendarClassName,
      ...calendarProps
    },
    ref
  ) => {
    const [internalCaptionLayout, setInternalCaptionLayout] = React.useState<CaptionLayout>(
      captionLayout ?? defaultCaptionLayout
    )
    const selectId = React.useId()

    const currentCaptionLayout = captionLayout ?? internalCaptionLayout

    React.useEffect(() => {
      if (captionLayout !== undefined) {
        setInternalCaptionLayout(captionLayout)
      }
    }, [captionLayout])

    const handleCaptionLayoutChange = React.useCallback(
      (value: string) => {
        const layout = value as CaptionLayout

        if (!captionLayout) {
          setInternalCaptionLayout(layout)
        }

        onCaptionLayoutChange?.(layout)
      },
      [captionLayout, onCaptionLayoutChange]
    )

    const {
      className: triggerClassName,
      id: triggerIdProp,
      size: triggerSize,
      ...restTriggerProps
    } = selectTriggerProps ?? {}

    const { className: labelClassName, htmlFor: labelHtmlFor, ...restLabelProps } =
      labelProps ?? {}

    const { className: contentClassName, align: contentAlign, ...restContentProps } =
      selectContentProps ?? {}

    const triggerId = triggerIdProp ?? selectId

    return (
      <div ref={ref} className={cn("flex flex-col gap-4", className)}>
        <Calendar
          {...calendarProps}
          className={cn("rounded-lg border shadow-sm", calendarClassName)}
          captionLayout={currentCaptionLayout}
        />
        {showCaptionLayoutSelect && captionLayoutOptions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {captionLayoutLabel !== null ? (
              <Label
                {...restLabelProps}
                htmlFor={labelHtmlFor ?? triggerId}
                className={cn("px-1", labelClassName)}
              >
                {captionLayoutLabel}
              </Label>
            ) : null}
            <Select
              {...selectProps}
              value={currentCaptionLayout}
              onValueChange={handleCaptionLayoutChange}
            >
              <SelectTrigger
                {...restTriggerProps}
                id={triggerId}
                size={triggerSize ?? "sm"}
                className={cn("bg-background w-full", triggerClassName)}
              >
                <SelectValue
                  placeholder={
                    selectPlaceholder ??
                    (typeof captionLayoutLabel === "string"
                      ? captionLayoutLabel
                      : "Select caption layout")
                  }
                />
              </SelectTrigger>
              <SelectContent
                {...restContentProps}
                align={contentAlign ?? "center"}
                className={cn(contentClassName)}
              >
                {captionLayoutOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
    )
  }
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
