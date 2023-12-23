import { BaseElement, html } from "../base-element.js";
import {
  range,
  zip,
  createCanvasContext,
  loadUrlAsElement,
  convertImageToImageData,
  convertImageDataToPixelData,
} from "../../util.js";

export class NpPetElement extends BaseElement {
  #screenWidth = 32;
  #screenHeight = 16;
  #petSize = 16;
  #imageDatas = new Map();
  #pixelDatas = new Map();
  #state = "loading";
  #favicon;
  #faviconColors = [
    [128, 128, 128, 0],
    [128, 128, 128, 255],
  ];
  #offset = 0;
  #screenCtx = createCanvasContext({
    width: this.#screenWidth,
    height: this.#screenHeight,
  });
  #faviconCtx = createCanvasContext({
    width: this.#petSize,
    height: this.#petSize,
  });

  connectedCallback() {
    this.shadowRoot.innerHTML = html`
      <link rel="stylesheet" href="${import.meta.resolve("./np-pet.css")}" />
      <div
        class="pixel-grid"
        style="
          --screen-width: ${this.#screenWidth};
          --screen-height: ${this.#screenHeight};
        "
      >
        ${range(this.#screenHeight)
          .map((y) => {
            return range(this.#screenWidth)
              .map((x) => {
                return html`<div
                  class="pixel"
                  data-color="0"
                  data-x="${x}"
                  data-y="${y}"
                ></div>`;
              })
              .join("");
          })
          .join("")}
      </div>
    `;

    this.#load();
  }

  #urlForState(state) {
    return import.meta.resolve(`./img/${state}.png`);
  }

  async #load() {
    if (this.#state !== "loading") {
      return;
    }
    await this.#loadState("idle");
    this.#setState("idle");
  }

  async #loadState(state) {
    const image = await loadUrlAsElement(this.#urlForState(state));
    const imageData = convertImageToImageData(image);
    const pixelData = convertImageDataToPixelData(imageData);
    this.#pixelDatas.set(state, pixelData);
    this.#imageDatas.set(state, imageData);
  }

  #setState(state) {
    this.#state = state;
    this.#updatePixels();
    this.#updateFavicon();
  }

  #getPixelData(state) {
    if (!this.#pixelDatas.has(state)) {
      throw new Error(`Unknown state: ${state}`);
    }
    return this.#pixelDatas.get(state);
  }

  #getImageData(state) {
    if (!this.#imageDatas.has(state)) {
      throw new Error(`Unknown state: ${state}`);
    }
    return this.#imageDatas.get(state);
  }

  #pixelElements() {
    return [...this.shadowRoot.querySelectorAll(".pixel")];
  }

  #updatePixels() {
    const ctx = this.#screenCtx;
    const imageData = this.#getImageData(this.#state);
    ctx.clearRect(0, 0, this.#screenWidth, this.#screenHeight);
    ctx.putImageData(imageData, this.#offset, 0);
    const pixelData = convertImageDataToPixelData(
      ctx.getImageData(0, 0, this.#screenWidth, this.#screenHeight)
    );
    for (const [element, color] of zip(this.#pixelElements(), pixelData)) {
      element.dataset.color = color;
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

  #updateFavicon() {
    const pixelColors = this.#getPixelData(this.#state);
    const favicon = this.#getOrCreateFavicon();
    const ctx = this.#faviconCtx;
    const { canvas } = ctx;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    const imageData = ctx.createImageData(width, height);
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
