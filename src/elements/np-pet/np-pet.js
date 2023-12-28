import { BaseElement, html } from "../base-element.js";
import {
  range,
  zip,
  createCanvasContext,
  loadUrlAsElement,
  convertImageToImageData,
  convertImageDataToPixelData,
  randomBoolean,
} from "../../util.js";

export class NpPetElement extends BaseElement {
  #framesSinceIdle = 0;
  #tickRate = 1000;
  #frame = 0;
  #states = ["idle", "happy", "sleep"];
  #state = "loading";
  #screenWidth = 32;
  #screenHeight = 16;
  #petSize = 16;
  #offset = this.#screenWidth / 2 - this.#petSize / 2;
  #offsetMax = this.#screenWidth - this.#petSize;
  #imageDatas = new Map();
  #pixelDatas = new Map();
  #theme = "light";
  #favicon = "default";
  #faviconElement;
  #faviconColors = {
    default: [
      [0, 0, 0, 0],
      [128, 128, 128, 255],
    ],
    white: [
      [0, 0, 0, 0],
      [255, 255, 255, 255],
    ],
    black: [
      [0, 0, 0, 0],
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

  #onTick = () => {
    this.#frame = (this.#frame + 1) % 2;
    if (this.state === "idle") {
      this.#framesSinceIdle = 0;
      const willMove = randomBoolean();
      if (willMove) {
        const quarter = this.#offsetMax / 4;
        let direction = 0;
        if (this.#offset < quarter) {
          direction = 1;
        } else if (this.#offset > 3 * quarter) {
          direction = -1;
        } else {
          direction = randomBoolean() ? 1 : -1;
        }
        this.#offset += direction;
      }
    } else if (this.state === "happy") {
      this.#framesSinceIdle++;
      if (this.#framesSinceIdle > 4) {
        this.state = "idle";
      }
    } else if (this.state === "sleep") {
    }
    this.render();
    if (this.isConnected) {
      setTimeout(this.#onTick, this.#tickRate);
    }
  };

  get state() {
    return this.#state;
  }

  set state(value) {
    if (value === "idle") {
      this.#framesSinceIdle = 0;
    }
    this.#state = value;
    this.dataset.state = value;
    this.render();
  }

  get favicon() {
    return this.#favicon;
  }

  set favicon(value) {
    this.#favicon = value;
    this.dataset.favicon = value;
    this.render();
  }

  get theme() {
    return this.#theme;
  }

  set theme(value) {
    this.#theme = value;
    this.dataset.theme = value;
    this.render();
  }

  interact(action) {
    if (action === "sleep") {
      if (this.state === "sleep") {
        this.state = "idle";
      } else {
        this.state = "sleep";
      }
    } else if (action === "play") {
      if (this.state === "sleep") {
        this.state = "idle";
      } else {
        this.state = "happy";
      }
    } else {
      throw new Error(`unknown action: ${action}`);
    }
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
    this.dataset.theme = this.theme;
    this.dataset.favicon = this.favicon;
    this.#updatePixels();
    this.#updateFavicon();
  }

  #urlForFrame(state) {
    return import.meta.resolve(`./img/${state}.png`);
  }

  async #load() {
    if (this.state !== "loading") {
      return;
    }
    await Promise.all(this.#states.map((state) => this.#loadState(state)));
    this.state = "idle";
    this.#onTick();
  }

  async #loadState(state) {
    await Promise.all(
      range(2).map((frame) => {
        return this.#loadFrame(this.#getFrameFileName(state, frame));
      })
    );
  }

  async #loadFrame(frame) {
    const image = await loadUrlAsElement(this.#urlForFrame(frame));
    const imageData = convertImageToImageData(image);
    const pixelData = convertImageDataToPixelData(imageData);
    this.#pixelDatas.set(frame, pixelData);
    this.#imageDatas.set(frame, imageData);
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

  #getFrameFileName(state, frame) {
    const suffix = String(frame + 1).padStart(2, "0");
    return `${state}${suffix}`;
  }

  #updatePixels() {
    const ctx = this.#screenCtx;
    const imageData = this.#getImageData(
      this.#getFrameFileName(this.state, this.#frame)
    );
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
    this.#faviconElement ||=
      document.querySelector("link[rel='icon'][sizes='16x16']") ||
      this.#createFavicon();
    return this.#faviconElement;
  }

  #createFavicon() {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.sizes = "16x16";
    document.head.append(favicon);
    return favicon;
  }

  #updateFavicon() {
    const pixelColors = this.#getPixelData(
      this.#getFrameFileName(this.state, this.#frame)
    );
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
