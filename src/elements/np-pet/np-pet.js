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
  #happiness = 3;
  #state = "loading";
  #screenWidth = 32;
  #screenHeight = 16;
  #petSize = 16;
  #offset = this.#screenWidth / 2 - this.#petSize / 2;
  #imageDatas = new Map();
  #pixelDatas = new Map();
  #theme = "light";
  #favicon = "default";
  #faviconElement;
  #faviconColors = {
    default: [
      [128, 128, 128, 32],
      [128, 128, 128, 255],
    ],
    white: [
      [255, 255, 255, 32],
      [255, 255, 255, 255],
    ],
    black: [
      [0, 0, 0, 32],
      [0, 0, 0, 255],
    ],
  };
  #screenCtx = createCanvasContext({
    width: this.#screenWidth,
    height: this.#screenHeight,
  });
  #faviconCtx = createCanvasContext({
    width: this.#petSize,
    height: this.#petSize,
  });

  get state() {
    return this.#state;
  }

  set state(value) {
    this.#state = value;
    this.render();
  }

  get happiness() {
    return this.#happiness;
  }

  set happiness(value) {
    this.#happiness = value;
    this.render();
  }

  get favicon() {
    return this.#favicon;
  }

  set favicon(value) {
    this.#favicon = value;
    this.render();
  }

  get theme() {
    return this.#theme;
  }

  set theme(value) {
    this.#theme = value;
    this.render();
  }

  onConnect() {
    this.shadowRoot.innerHTML = html`
      <link rel="stylesheet" href="${import.meta.resolve("./np-pet.css")}" />
      <div class="pixel-grid">
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
    const grid = this.#pixelGrid;
    grid.style.setProperty("--screen-width", String(this.#screenWidth));
    grid.style.setProperty("--screen-height", String(this.#screenHeight));
    this.#load();
  }

  render() {
    if (this.state === "loading") {
      return;
    }
    this.#updatePixels();
    this.#updateFavicon();
  }

  #urlForState(state) {
    return import.meta.resolve(`./img/${state}.png`);
  }

  async #load() {
    if (this.state !== "loading") {
      return;
    }
    await this.#loadState("idle");
    this.state = "idle";
  }

  async #loadState(state) {
    const image = await loadUrlAsElement(this.#urlForState(state));
    const imageData = convertImageToImageData(image);
    const pixelData = convertImageDataToPixelData(imageData);
    this.#pixelDatas.set(state, pixelData);
    this.#imageDatas.set(state, imageData);
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
    const imageData = this.#getImageData(this.state);
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
    this.#faviconElement ||= document.querySelector("#np-pet-favicon");
    this.#faviconElement ||= this.#createFavicon();
    return this.#faviconElement;
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
    const pixelColors = this.#getPixelData(this.state);
    const favicon = this.#getOrCreateFavicon();
    const ctx = this.#faviconCtx;
    const { canvas } = ctx;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    const imageData = ctx.createImageData(width, height);
    for (let i = 0; i < pixelColors.length; i++) {
      const color = pixelColors[i];
      const palette = this.#faviconColors[this.#favicon];
      const [r, g, b, a] = palette[color];
      const j = i * 4;
      imageData.data[j + 0] = r;
      imageData.data[j + 1] = g;
      imageData.data[j + 2] = b;
      imageData.data[j + 3] = a;
    }
    ctx.putImageData(imageData, 0, 0);
    favicon.href = canvas.toDataURL();
  }

  get #pixelGrid() {
    return this.shadowRoot.querySelector(".pixel-grid");
  }
}

customElements.define("np-pet", NpPetElement);
