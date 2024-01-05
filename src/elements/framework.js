export class BaseElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
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
    for (const [eventType, selector, method] of this.events) {
      if (!method) {
        return this.error(`missing method for ${eventType} @ ${selector}`);
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
      return this.error(`element not found: ${selector}`);
    }
    return element;
  }

  $$(selector) {
    return [...this.shadowRoot.querySelectorAll(selector)];
  }

  render() {}

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
}

function safeHtml(value) {
  if (Array.isArray(value)) {
    return value.map(safeHtml).join("");
  }
  if (value instanceof html.SafeString) {
    return value.toString();
  }
  if (typeof value === "number" || typeof value === "string") {
    return html.escape(value);
  }
  throw new Error(`Invalid value: ${value}`);
}

export function html(strings, ...values) {
  const s = String.raw({ raw: strings }, ...values.map(safeHtml));
  return new html.SafeString(s);
}

const escapeElement = document.createElement("div");

html.escape = function escape(value) {
  escapeElement.textContent = value;
  return escapeElement.innerHTML
    .replaceAll("'", "&apos;")
    .replaceAll('"', "&quot;");
};

html.SafeString = class SafeString {
  get [Symbol.toStringTag]() {
    return "html.SafeString";
  }

  value;

  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value;
  }
};
