interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale?: Intl.LocalesArgument
}

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>()

function getDateFormatter(
  locale: Intl.LocalesArgument,
  options: Intl.DateTimeFormatOptions
) {
  const key = JSON.stringify([locale, options])
  const cachedFormatter = dateFormatters.get(key)

  if (cachedFormatter) {
    return cachedFormatter
  }

  const formatter = Intl.DateTimeFormat(locale, options)
  dateFormatters.set(key, formatter)
  return formatter
}

// fallow-ignore-next-line complexity
export function formatDate(
  value: Date | number | string | null | undefined,
  options: FormatDateOptions = {}
) {
  if (value === null || value === undefined || value === "") {
    return ""
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const { locale, ...formatOptions } = options
  const hasCustomOptions =
    locale !== undefined || Object.keys(formatOptions).length > 0

  if (!hasCustomOptions) {
    return getDateFormatter(undefined, DEFAULT_DATE_OPTIONS).format(date)
  }

  return getDateFormatter(locale, {
    ...DEFAULT_DATE_OPTIONS,
    ...formatOptions,
  }).format(date)
}
