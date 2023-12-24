import { BaseElement, html } from "../base-element.js";
import "../np-pet/np-pet.js";
import "../np-menu/np-menu.js";

export class NpAppElement extends BaseElement {
  #theme = localStorage.getItem("theme") || "light";
  #favicon = localStorage.getItem("favicon") || "default";

  onConnect() {
    this.shadowRoot.innerHTML = html`
      <link rel="stylesheet" href="${import.meta.resolve("./np-app.css")}" />
      <div class="frame">
        <h1 class="heading">netpet</h1>
        <div class="screen">
          <np-pet></np-pet>
        </div>
        <div class="controls">
          <button class="button" data-action="menu">menu</button>
          <button class="button" data-action="sleep">sleep</button>
          <button class="button" data-action="play">play</button>
        </div>
      </div>
      <np-menu></np-menu>
    `;
    this.shadowRoot.addEventListener("click", this);
    this.shadowRoot.addEventListener("np-menu-option-change", this);
    this.#syncOptions();
  }

  onDisconnect() {
    this.shadowRoot.removeEventListener("click", this);
    this.shadowRoot.removeEventListener("np-menu-option-change", this);
  }

  handleEvent(event) {
    if (event.type === "click") {
      const { action } = event.target.dataset;
      this.#handleClick(action);
    } else if (event.type === "np-menu-option-change") {
      const { name, value } = event.detail;
      this.#handleOptionChange({ name, value });
    }
  }

  get theme() {
    return this.#theme;
  }

  set theme(value) {
    this.#theme = value;
    this.#pet.theme = value;
    this.#menu.theme = value;
    this.dataset.theme = this.theme;
    localStorage.setItem("theme", value);
  }

  get favicon() {
    return this.#favicon;
  }

  set favicon(value) {
    this.#favicon = value;
    this.#pet.favicon = value;
    this.#menu.favicon = value;
    localStorage.setItem("favicon", value);
  }

  #syncOptions() {
    this.dataset.theme = this.theme;
    this.#pet.theme = this.theme;
    this.#pet.favicon = this.favicon;
    this.#menu.theme = this.theme;
    this.#menu.favicon = this.favicon;
  }

  #handleClick(action) {
    if (action === "play" || action === "sleep") {
      this.#pet.interact(action);
    } else if (action === "menu") {
      this.#menu.show();
    }
  }

  #handleOptionChange({ name, value }) {
    this[name] = value;
  }

  get #pet() {
    return this.shadowRoot.querySelector("np-pet");
  }

  get #menu() {
    return this.shadowRoot.querySelector("np-menu");
  }
}

customElements.define("np-app", NpAppElement);
