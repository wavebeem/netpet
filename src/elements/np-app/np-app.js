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
  }

  onDisconnect() {
    this.shadowRoot.removeEventListener("click", this);
  }

  handleEvent(event) {
    const { action } = event.target.dataset;
    if (action === "play") {
      this.#pet.offset--;
    } else if (action === "sound") {
      this.#pet.offset++;
    } else if (action === "menu") {
      this.#settings.show();
    }
  }

  get #pet() {
    return this.shadowRoot.querySelector("np-pet");
  }

  get #settings() {
    return this.shadowRoot.querySelector("np-menu");
  }
}

customElements.define("np-app", NpAppElement);
