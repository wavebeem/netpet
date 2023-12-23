import { BaseElement, html } from "../base-element.js";
import "../np-pet/np-pet.js";

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
          <button class="button" data-action="feed">feed</button>
          <button class="button" data-action="clean">clean</button>
          <button class="button" data-action="menu">menu</button>
        </div>
      </div>
    `;
    this.shadowRoot.addEventListener("click", this);
  }

  onDisconnect() {
    this.shadowRoot.removeEventListener("click", this);
  }

  handleEvent(event) {
    const { action } = event.target.dataset;
    if (action === "feed") {
      this.#pet.offset--;
    } else if (action === "clean") {
      this.#pet.offset++;
    } else if (action === "menu") {
      this.#pet.offset = 32 / 2 - 16 / 2;
    }
  }

  get #pet() {
    return this.shadowRoot.querySelector("np-pet");
  }
}

customElements.define("np-app", NpAppElement);
