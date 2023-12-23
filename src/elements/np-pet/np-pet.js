import { BaseElement, html } from "../base-element.js";
import { range, zip, loadImageAsPixelData } from "../../util.js";

const screenWidth = 16;
const screenHeight = 16;

export class NpPetElement extends BaseElement {
  #pixelColors = new Map();
  #state = "loading";
  #favicon;
  #faviconColors = [
    [128, 128, 128, 0],
    [128, 128, 128, 32],
    [128, 128, 128, 128],
    [128, 128, 128, 255],
  ];

  connectedCallback() {
    this.shadowRoot.innerHTML = html`
      <link rel="stylesheet" href="${import.meta.resolve("./np-pet.css")}" />
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
    return import.meta.resolve(`./img/${state}.png`);
    // return new URL(`img/${state}.png`, import.meta.url).href;
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
    const pixelColors = this.#getPixelColors("idle");
    this.#updatePixels(pixelColors);
    this.#updateFavicon(pixelColors);
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

  #getOrCreateFavicon() {
    this.#favicon ||= document.querySelector("#np-pet-favicon");
    this.#favicon ||= this.#createFavicon();
    return this.#favicon;
  }

  #createFavicon() {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.sizes = "16x16";
    favicon.id = "np-pet-favicon";
    document.head.append(favicon);
    return favicon;
  }

  #updateFavicon(pixelColors) {
    const favicon = this.#getOrCreateFavicon();
    const canvas = document.createElement("canvas");
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < pixelColors.length; i++) {
      const color = pixelColors[i];
      const [r, g, b, a] = this.#faviconColors[color];
      const j = i * 4;
      imageData.data[j + 0] = r;
      imageData.data[j + 1] = g;
      imageData.data[j + 2] = b;
      imageData.data[j + 3] = a;
    }
    ctx.putImageData(imageData, 0, 0);
    favicon.href = canvas.toDataURL();
  }
}

customElements.define("np-pet", NpPetElement);
