import type { ComposerTranslation } from "vue-i18n";
import type { Component } from "vue";

// refer to vitepress default theme
const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i;
const INTERNAL_ABS_URL_RE = /^(?:[a-z]|\/)/i;

type IndexResponse = "mobile" | "pad" | "desktop";
type IndexLinkMode = "_blank" | "_self";
type IndexActivateEvent = "click" | "mouseenter";
type IndexPlacement = "top" | "bottom" | "left" | "right";
type IndexSize = "small" | "medium" | "large";
type IndexDirection = "col" | "row";

type IndexText = string | ((t?: ComposerTranslation) => string);
type IndexIcon = string | Component;
type IndexLink = {
  href?: string;
  _target?: IndexLinkMode;
};
type IndexTextLink = IndexLink & { text: IndexText };

export { EXTERNAL_URL_RE, INTERNAL_ABS_URL_RE };
export type {
  IndexText,
  IndexIcon,
  IndexLink,
  IndexDirection,
  IndexActivateEvent,
  IndexResponse,
  IndexPlacement,
  IndexTextLink,
  IndexSize,
};
