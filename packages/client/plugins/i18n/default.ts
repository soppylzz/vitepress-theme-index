import type { I18nDatetimeFormatSchema, LocaleMessages } from "@vitepress-theme-index/shared";

const defaultMessage = {
  docs: {
    prev: "prev page",
    next: "next page",
    footer: {
      owner: "Maintained by",
      theme: "Powered by",
    },
  },
} satisfies LocaleMessages;

const defaultDateFormat = {
  short: {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  },
  long: {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  },
  date: {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  time: {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  },
} satisfies I18nDatetimeFormatSchema;

export { defaultMessage, defaultDateFormat };
