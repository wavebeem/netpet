import { BaseElement, html } from "../base-element.js";

export class NpMenuElement extends BaseElement {
  #favicon;
  #theme;

  onConnect() {
    this.shadowRoot.innerHTML = html`
      <link
        rel="stylesheet"
        href="${import.meta.resolve("../../lib/2bit-ui.css")}"
      />
      <link rel="stylesheet" href="${import.meta.resolve("./np-menu.css")}" />
      <dialog class="bit-root bit-scrollbar">
        <form method="dialog">
          <h2>menu</h2>
          <label class="flex-column">
            <span>theme</span>
            <select class="bit-select" name="theme">
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
          </label>
          <label class="flex-column">
            <span>favicon</span>
            <select class="bit-select" name="favicon">
              <option value="default">default</option>
              <option value="white">white</option>
              <option value="black">black</option>
              <option value="green">green</option>
            </select>
          </label>
          <p>
            whisper &amp; fantasma fonts<br />&copy;
            <a
              class="bit-link"
              target="_blank"
              href="https://www.froyotam.info/"
              >froyo tam</a
            >
          </p>
          <p>
            background textures<br />&copy;
            <a class="bit-link" target="_blank" href="https://css-pattern.com/"
              >temani afif</a
            >
          </p>
          <p>
            code &amp; images<br />&copy;
            <a class="bit-link" target="_blank" href="https://www.wavebeem.com"
              >sage fennel</a
            >
          </p>
          <div class="flex-right">
            <button class="bit-button">close</button>
          </div>
        </form>
      </dialog>
    `;
    this.shadowRoot.addEventListener("change", this);
  }

  onDisconnect() {
    this.shadowRoot.removeEventListener("change", this);
  }

  render() {
    this.#optionTheme.value = this.#theme;
    this.#optionFavicon.value = this.#favicon;
  }

  get #optionFavicon() {
    return this.#dialog.querySelector("[name=favicon]");
  }

  get #optionTheme() {
    return this.#dialog.querySelector("[name=theme]");
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

  handleEvent(event) {
    const { name, value } = event.target;
    this.dispatchCustomEvent("np-menu-option-change", { name, value });
  }

  show() {
    this.#dialog.showModal();
  }

  get #dialog() {
    return this.shadowRoot.querySelector("dialog");
  }
}

customElements.define("np-menu", NpMenuElement);
