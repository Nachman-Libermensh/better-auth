export function formatDateTime(value: string | Date | null) {
  if (!value) {
    return "—";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatBoolean(value: boolean, trueLabel = "כן", falseLabel = "לא") {
  return value ? trueLabel : falseLabel;
}
