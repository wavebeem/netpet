import { attrToProp } from "../util.js";

export class BaseElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // this.#defineProperties();
  }

  render() {}

  attributeChangedCallback(name, oldValue, newValue) {
    // TODO: Sync attributes to properties and trigger a render
  }

  connectedCallback() {
    this.onConnect();
  }

  onConnect() {}

  disconnectedCallback() {
    this.onDisconnect();
  }

  onDisconnect() {}

  dispatchCustomEvent(name, detail) {
    const event = new CustomEvent(name, {
      bubbles: true,
      composed: true,
      detail,
    });
    this.dispatchEvent(event);
  }

  #defineProperties() {
    if (!this.constructor.propTypes) {
      return;
    }
    for (const [attr, valueType] of Object.entries(
      this.constructor.propTypes
    )) {
      const prop = attrToProp(attr);
      if (valueType === "number") {
        this.#definePropertyNumber(prop, attr);
      } else if (valueType === "boolean") {
        this.#definePropertyBoolean(prop, attr);
      } else if (valueType === "string") {
        this.#definePropertyString(prop, attr);
      } else {
        throw new Error(`Unknown type: ${valueType}`);
      }
    }
  }

  #definePropertyString(prop, attr) {
    Object.defineProperty(this, prop, {
      get: () => {
        const val = this.getAttribute(attr);
        if (val == null) {
          return undefined;
        }
        return String(val);
      },
      set: (value) => {
        if (value == null) {
          this.removeAttribute(attr);
          return;
        }
        this.setAttribute(attr, String(value));
        this.render();
      },
    });
  }

  #definePropertyBoolean(prop, attr) {
    Object.defineProperty(this, prop, {
      get: () => {
        return this.getAttribute(attr) != null;
      },
      set: (value) => {
        if (!value) {
          this.removeAttribute(attr);
          return;
        }
        this.setAttribute(attr, "");
        this.render();
      },
    });
  }

  #definePropertyNumber(prop, attr) {
    Object.defineProperty(this, prop, {
      get: () => {
        const val = this.getAttribute(attr);
        if (val == null) {
          return undefined;
        }
        return Number(val);
      },
      set: (value) => {
        if (value == null) {
          this.removeAttribute(attr);
          return;
        }
        this.setAttribute(attr, Number(value));
        this.render();
      },
    });
  }
}

export const html = String.raw;
