import type { I18nDatetimeFormatSchema, LocaleMessages } from "@vitepress-theme-index/shared";

const defaultMessage = {
  docs: {
    prev: "上一页",
    next: "下一页",
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
    theme: "主题",
    search: "搜索",
  },
  footer: {
    docs: {
      owner: "维护者",
      theme: "主题",
    },
  },
  search: {
    placeholder: "输入搜索内容",
    loading: "正在搜索",
    help: {
      head: "搜索帮助",
      nav: "导航",
      close: "关闭",
      open: "打开",
    },
    powered: "搜索引擎",
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
