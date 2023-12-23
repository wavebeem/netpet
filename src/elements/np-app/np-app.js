import { BaseElement, html } from "../base-element.js";
import "../np-pet/np-pet.js";
import "../np-menu/np-menu.js";

export class NpAppElement extends BaseElement {
  onConnect() {
    this.shadowRoot.innerHTML = html`
      <link rel="stylesheet" href="${import.meta.resolve("./np-app.css")}" />
      <div class="frame">
        <h1 class="heading">netpet</h1>
        <div class="screen">
          <np-pet></np-pet>
        </div>
        <div class="controls">
          <button class="button" data-action="play">play</button>
          <button class="button" data-action="sound">sound</button>
          <button class="button" data-action="sleep">sleep</button>
          <button class="button" data-action="menu">menu</button>
        </div>
      </div>
      <np-menu></np-menu>
    `;
    this.shadowRoot.addEventListener("click", this);
    this.shadowRoot.addEventListener("np-menu-option-change", this);
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

  #handleClick(action) {
    if (action === "play") {
      this.#pet.offset--;
    } else if (action === "sound") {
      this.#pet.offset++;
    } else if (action === "menu") {
      this.#settings.show();
    }
  }

  #handleOptionChange({ name, value }) {
    console.log("Got option change:", name, value);
  }

  get #pet() {
    return this.shadowRoot.querySelector("np-pet");
  }

  get #settings() {
    return this.shadowRoot.querySelector("np-menu");
  }
}

customElements.define("np-app", NpAppElement);
