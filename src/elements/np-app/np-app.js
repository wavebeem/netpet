import { BaseElement, html } from "../base-element.js";
import "../np-pet/np-pet.js";
import "../np-menu/np-menu.js";

export class NpAppElement extends BaseElement {
  #theme = localStorage.getItem("theme") || "light";
  #favicon = localStorage.getItem("favicon") || "default";

  events = [
    ["click", "[data-action='menu']", this.#onClickMenu],
    ["click", "[data-action='sleep']", this.#onClickSleep],
    ["click", "[data-action='play']", this.#onClickPlay],
    ["np-menu-option-change", "np-menu", this.#onOptionChange],
  ];

  onConnect() {
    this.shadowRoot.innerHTML = html`
      <link rel="stylesheet" href="${import.meta.resolve("./np-app.css")}" />
      <div class="frame">
        <h1 class="heading">netpet</h1>
        <div class="screen">
          <np-pet></np-pet>
        </div>
        <div class="controls">
          <button class="button" data-action="menu"><div>menu</div></button>
          <button class="button" data-action="sleep">sleep</button>
          <button class="button" data-action="play">play</button>
        </div>
      </div>
      <np-menu></np-menu>
    `;
    this.#syncOptions();
  }

  #onClickMenu(_event) {
    this.#$menu.show();
  }

  #onClickSleep(_event) {
    this.#$pet.interact("sleep");
  }

  #onClickPlay(_event) {
    this.#$pet.interact("play");
  }

  #onOptionChange(event) {
    const { name, value } = event.detail;
    this[name] = value;
  }

  get theme() {
    return this.#theme;
  }

  set theme(value) {
    this.#theme = value;
    this.#$pet.theme = value;
    this.#$menu.theme = value;
    this.dataset.theme = this.theme;
    localStorage.setItem("theme", value);
  }

  get favicon() {
    return this.#favicon;
  }

  set favicon(value) {
    this.#favicon = value;
    this.#$pet.favicon = value;
    this.#$menu.favicon = value;
    localStorage.setItem("favicon", value);
  }

  #syncOptions() {
    this.dataset.theme = this.theme;
    this.#$pet.theme = this.theme;
    this.#$pet.favicon = this.favicon;
    this.#$menu.theme = this.theme;
    this.#$menu.favicon = this.favicon;
  }

  get #$pet() {
    return this.$("np-pet");
  }

  get #$menu() {
    return this.$("np-menu");
  }
}

customElements.define("np-app", NpAppElement);
