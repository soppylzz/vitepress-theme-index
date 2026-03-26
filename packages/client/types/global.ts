import type { ComposerTranslation } from "vue-i18n";
import type { Component } from "vue";

// refer to vitepress default theme
const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i;

type IndexResponse = "mobile" | "pad" | "computer";
type IndexLinkMode = "_blank" | "_self";
type IndexActivateEvent = "click" | "mouseenter";
type IndexPlacement = "top" | "bottom" | "left" | "right";

type IndexText = string | ((t?: ComposerTranslation) => string);
type IndexIcon = string | Component;
type IndexLink = {
  href?: string;
  target?: IndexLinkMode;
};

export { EXTERNAL_URL_RE };
export type { IndexText, IndexIcon, IndexLink, IndexActivateEvent, IndexResponse, IndexPlacement };
