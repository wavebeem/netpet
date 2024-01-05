import { attrToProp } from "../util.js";

export class BaseElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // this.#defineProperties();
  }

  #abortController = new AbortController();

  error(message) {
    throw new Error(`<${this.localName}> ${message}`);
  }

  #bindEvents() {
    if (!this.events) {
      return;
    }
    const options = { signal: this.#abortController.signal };
    for (const [eventType, selector, method] of this.events || []) {
      if (!method) {
        return this.error(`Missing method for ${eventType} @ ${selector}`);
      }
      this.shadowRoot.addEventListener(eventType, this, options);
    }
  }

  handleEvent(event) {
    for (const [eventType, selector, method] of this.events) {
      const element = event.target.closest(selector);
      if (event.type === eventType && element) {
        method.call(this, event);
      }
    }
  }

  $(selector) {
    const element = this.shadowRoot.querySelector(selector);
    if (!element) {
      return this.error(`Element not found: ${selector}`);
    }
    return element;
  }

  $$(selector) {
    return [...this.shadowRoot.querySelectorAll(selector)];
  }

  render() {}

  attributeChangedCallback(name, oldValue, newValue) {
    // TODO: Sync attributes to properties and trigger a render
  }

  connectedCallback() {
    this.#bindEvents();
    this.onConnect();
  }

  onConnect() {}

  disconnectedCallback() {
    this.#abortController.abort();
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

  // #defineProperties() {
  //   if (!this.constructor.propTypes) {
  //     return;
  //   }
  //   for (const [attr, valueType] of Object.entries(
  //     this.constructor.propTypes
  //   )) {
  //     const prop = attrToProp(attr);
  //     if (valueType === "number") {
  //       this.#definePropertyNumber(prop, attr);
  //     } else if (valueType === "boolean") {
  //       this.#definePropertyBoolean(prop, attr);
  //     } else if (valueType === "string") {
  //       this.#definePropertyString(prop, attr);
  //     } else {
  //       throw new Error(`Unknown type: ${valueType}`);
  //     }
  //   }
  // }

  // #definePropertyString(prop, attr) {
  //   Object.defineProperty(this, prop, {
  //     get: () => {
  //       const val = this.getAttribute(attr);
  //       if (val == null) {
  //         return undefined;
  //       }
  //       return String(val);
  //     },
  //     set: (value) => {
  //       if (value == null) {
  //         this.removeAttribute(attr);
  //         return;
  //       }
  //       this.setAttribute(attr, String(value));
  //       this.render();
  //     },
  //   });
  // }

  // #definePropertyBoolean(prop, attr) {
  //   Object.defineProperty(this, prop, {
  //     get: () => {
  //       return this.getAttribute(attr) != null;
  //     },
  //     set: (value) => {
  //       if (!value) {
  //         this.removeAttribute(attr);
  //         return;
  //       }
  //       this.setAttribute(attr, "");
  //       this.render();
  //     },
  //   });
  // }

  // #definePropertyNumber(prop, attr) {
  //   Object.defineProperty(this, prop, {
  //     get: () => {
  //       const val = this.getAttribute(attr);
  //       if (val == null) {
  //         return undefined;
  //       }
  //       return Number(val);
  //     },
  //     set: (value) => {
  //       if (value == null) {
  //         this.removeAttribute(attr);
  //         return;
  //       }
  //       this.setAttribute(attr, Number(value));
  //       this.render();
  //     },
  //   });
  // }
}

export const html = String.raw;

// export function html(strings, ...values) {
//   // const safeValues = values;
//   // return String.raw({ raw: strings }, ...safeValues);
//   const safeValues = values.flat().map((v) => {
//     console.log("HTML?", v);
//     if (v instanceof html.SafeString) {
//       return v.toString();
//     }
//     return html.escape(v);
//   });
//   return new html.SafeString(String.raw({ raw: strings }, ...safeValues));
// }

// const escapeElement = document.createElement("div");

// html.escape = function escape(value) {
//   escapeElement.textContent = value;
//   return escapeElement.innerHTML;
// };

// html.SafeString = class SafeString extends String {
//   BLAH = "safestring";
//   [Symbol.toStringTag] = "SafeString";
// };
