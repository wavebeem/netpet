import { BaseElement, html } from "./base-element.js";
import { range, zip, loadImageAsPixelData } from "../util.js";

const screenWidth = 16;
const screenHeight = 16;

class NpAppElement extends BaseElement {
  #pixelColors = new Map();
  #state = "loading";

  connectedCallback() {
    this.shadowRoot.innerHTML = html`
      <link rel="stylesheet" href="${this.cssURL}" />
      <div
        class="pixel-grid"
        style="
          --screen-width: ${screenWidth};
          --screen-height: ${screenHeight};
        "
      >
        ${range(screenWidth * screenHeight)
          .map(() => {
            return html`<div class="pixel" data-pixel-color="0"></div>`;
          })
          .join("")}
      </div>
    `;

    this.#load();
  }

  #urlForState(state) {
    return new URL(`${this.localName}--${state}.png`, import.meta.url).href;
  }

  async #load() {
    this.#pixelColors.set(
      "idle",
      await loadImageAsPixelData(this.#urlForState("idle"))
    );
    if (this.#state !== "loading") {
      return;
    }
    this.#setState("#idle");
  }

  #setState() {
    this.#updatePixels(this.#getPixelColors("idle"));
  }

  #getPixelColors(state) {
    if (!this.#pixelColors.has(state)) {
      throw new Error(`Unknown state: ${state}`);
    }
    return this.#pixelColors.get(state);
  }

  #pixelElements() {
    return [...this.shadowRoot.querySelectorAll(".pixel")];
  }

  #updatePixels(pixelColors) {
    for (const [element, color] of zip(this.#pixelElements(), pixelColors)) {
      element.dataset.pixelColor = color;
    }
  }
}

customElements.define("np-pet", NpAppElement);
