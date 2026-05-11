import type { KeydownEventItem, KeydownInternalItem } from "../../types";
import { debounce } from "lodash-unified";
import { isBrowser, runtimeLogger } from "@vitepress-theme-index/shared";

const idSeparator = "-";
const modifyKeys = ["control", "shift", "alt", "meta"] as const;

class KeydownManager {
  private static instance: KeydownManager;
  private itemCache = new Map<string, [counter: number, handlers: KeydownInternalItem[]]>();
  private scopeCache: [counter: number, scope: string][] = [];
  private pressedKeys: string[] = [];
  private listening = false;

  private constructor() {
    this.startListen();
  }

  static getInstance(): KeydownManager {
    if (!KeydownManager.instance) {
      KeydownManager.instance = new KeydownManager();
    }
    return KeydownManager.instance;
  }

  static norm(raw: string) {
    return raw
      .split("+")
      .map((s) => s.trim())
      .join("+")
      .toLowerCase();
  }

  pushScope(scope: string) {
    const existing = this.scopeCache.find(([, s]) => s === scope);
    if (existing) {
      existing[0]++;
    } else {
      this.scopeCache.push([1, scope]);
    }
  }

  popScope(scope: string) {
    const idx = this.scopeCache.findIndex(([, s]) => s === scope);
    if (idx === -1) return;
    const entry = this.scopeCache[idx];
    entry[0]--;
    if (entry[0] <= 0) {
      this.scopeCache.splice(idx, 1);
    }
  }

  private isScopeActive(scope: string): boolean {
    return this.scopeCache.some(([, s]) => s === scope);
  }

  private startListen() {
    if (this.listening) return;
    this.listening = true;

    if (isBrowser()) {
      window.addEventListener("keydown", this.onKeydown);
      window.addEventListener("keyup", this.onKeyup);
    }
  }

  private onKeydown = async (e: KeyboardEvent) => {
    const key = e.key?.toLowerCase();
    if (!key) return;

    const isModifier = (modifyKeys as ReadonlyArray<string>).includes(key);
    if (!isModifier && !this.pressedKeys.includes(key)) {
      this.pressedKeys.push(key);
    }

    await this.checkAndTrigger(e);
  };

  private onKeyup = (e: KeyboardEvent) => {
    const key = e.key?.toLowerCase();
    if (!key) return;
    const idx = this.pressedKeys.indexOf(key);
    if (idx !== -1) this.pressedKeys.splice(idx, 1);
  };

  register(item: KeydownEventItem): string {
    const normKey = KeydownManager.norm(item.key);

    const oldCache = this.itemCache.get(normKey) ?? [0, []];
    let counter = oldCache[0];
    const items = oldCache[1];
    counter++;

    const id = `${normKey}${idSeparator}${counter}`;
    const cache: KeydownInternalItem = {
      priority: 0,
      ...item,
      id,
      order: counter,
      handler: item?.delay && item.delay > 0 ? debounce(item.handler, item.delay) : item.handler,
    };

    items.push(cache);
    items.sort((a, b) => {
      const pa = a.priority ?? 0;
      const pb = b.priority ?? 0;
      if (pa !== pb) return pa - pb;
      return a.order - b.order;
    });

    this.itemCache.set(normKey, [counter, items]);
    return id;
  }

  unregister(id: string) {
    const lastDashIndex = id.lastIndexOf(idSeparator);
    if (lastDashIndex === -1) {
      runtimeLogger.error(`failed to resolve keydown event id: ${id}`);
    }

    const normKey = id.slice(0, lastDashIndex);
    const oldCache = this.itemCache.get(normKey)!;
    let counter = oldCache[0];
    const items = oldCache[1];
    const itemIdx = items.findIndex((item) => item.id === id);
    if (itemIdx === -1) {
      runtimeLogger.error(`failed to find keydown event id: ${id}`);
    }

    counter--;
    if (counter === 0) {
      this.itemCache.delete(normKey);
    } else {
      items.splice(itemIdx, 1);
      this.itemCache.set(normKey, [counter, items]);
    }
  }

  destroy() {
    this.listening = false;
    this.itemCache.clear();
    this.scopeCache.length = 0;
    this.pressedKeys.length = 0;
    if (isBrowser()) {
      window.removeEventListener("keydown", this.onKeydown);
      window.removeEventListener("keyup", this.onKeyup);
    }
  }

  private matchSequence(normKey: string): boolean {
    const parts = normKey.split("+");
    if (parts.length > this.pressedKeys.length) return false;
    const tail = this.pressedKeys.slice(-parts.length);
    return parts.every((k, i) => tail[i] === k);
  }

  private matchModifiers(item: KeydownInternalItem, e: KeyboardEvent): boolean {
    return (modifyKeys as ReadonlyArray<string>).every((key) => {
      const itemVal = (item as any)[key] as boolean | undefined;
      const eVal = e[`${key}Key` as keyof KeyboardEvent] as boolean;
      return itemVal === undefined || itemVal === eVal;
    });
  }

  private async checkAndTrigger(e: KeyboardEvent) {
    for (const [normKey, [, items]] of this.itemCache.entries()) {
      if (!this.matchSequence(normKey)) continue;

      for (const item of items) {
        if (item.scope && !this.isScopeActive(item.scope)) continue;
        if (!this.matchModifiers(item, e)) continue;

        await item.handler(e);
        if (item.stopTransmit) break;
      }
    }
  }
}

const keydownManager = KeydownManager.getInstance();
export { keydownManager };
