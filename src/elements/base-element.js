export class BaseElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  get cssURL() {
    return new URL(`${this.localName}.css`, import.meta.url).href;
  }
}

export const html = String.raw;
