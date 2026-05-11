import type { ComposerTranslation } from "vue-i18n";
import type { Component } from "vue";

/* =============== global types =============== */
type IndexResponse = "mobile" | "pad" | "desktop";
type IndexLinkMode = "_blank" | "_self";
type IndexActivateEvent = "click" | "mouseenter";
type IndexPlacement = "top" | "bottom" | "left" | "right";
type IndexSize = "small" | "medium" | "large";
type IndexDirection = "col" | "row";
type IndexAlign = "flex-start" | "center" | "flex-end";
type IndexOS = "mac" | "linux" | "win" | "unknown";

type IndexIcon = string | Component;
type IndexText = string | ((t?: ComposerTranslation) => string);
type IndexLink = { href?: string; _target?: IndexLinkMode };
type IndexTextLink = IndexLink & { text: IndexText };

// refer to vitepress default theme
const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i;
const INTERNAL_ABS_URL_RE = /^(?:[a-z]|\/)/i;

export { EXTERNAL_URL_RE, INTERNAL_ABS_URL_RE };
export type {
  IndexText,
  IndexIcon,
  IndexLink,
  IndexAlign,
  IndexDirection,
  IndexActivateEvent,
  IndexResponse,
  IndexPlacement,
  IndexTextLink,
  IndexSize,
  IndexOS,
};
