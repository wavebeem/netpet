import { BaseElement, html } from "../base-element.js";
import "../np-pet/np-pet.js";
import "../np-menu/np-menu.js";
import { playSound } from "../../util.js";

export class NpAppElement extends BaseElement {
  #volume = 0;
  #sounds = new Map();

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
    this.#load();
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
      this.#adjustVolume();
    } else if (action === "menu") {
      this.#settings.show();
    }
  }

  #handleOptionChange({ name, value }) {
    console.log("Got option change:", name, value);
  }

  #adjustVolume() {
    this.#volume = (this.#volume + 1) % 4;
    this.#pet.volume = this.#volume;
    this.#playSound("boop");
  }

  async #playSound(name) {
    await playSound(this.#getSound(name), this.#realVolume);
  }

  get #realVolume() {
    return 0.05 * this.#volume;
  }

  #getSound(name) {
    const audio = this.#sounds.get(name);
    if (!audio) {
      throw new Error(`No sound: ${name}`);
    }
    return audio;
  }

  async #load() {
    const sounds = ["alert", "boop", "happy"];
    await Promise.all(sounds.map((name) => this.#loadSound(name)));
  }

  async #loadSound(name) {
    return new Promise((resolve, reject) => {
      const url = import.meta.resolve(`./sounds/${name}.wav`);
      const audio = new Audio(url);
      audio.oncanplaythrough = () => {
        resolve(audio);
      };
      audio.onerror = () => {
        reject(new Error(`Failed to load sound: ${name}`));
      };
      this.#sounds.set(name, new Audio(url));
    });
  }

  get #pet() {
    return this.shadowRoot.querySelector("np-pet");
  }

  get #settings() {
    return this.shadowRoot.querySelector("np-menu");
  }
}

customElements.define("np-app", NpAppElement);
