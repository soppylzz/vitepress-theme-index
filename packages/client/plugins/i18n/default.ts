import type { I18nDatetimeFormatSchema, LocaleMessages } from "@vitepress-theme-index/shared";

const defaultMessage = {
  docs: {
    prev: "上一页",
    next: "下一页",
    footer: {
      owner: "维护者",
      theme: "主题",
    },
    card: {
      firstUpdate: "初次更新",
      lastUpdate: "上次更新",
      license: "许可协议",
    },
  },
  nav: {
    menu: "菜单",
    toc: "页面导航",
    locale: "语言",
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
