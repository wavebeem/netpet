import { BaseElement, html } from "../base-element.js";

export class NpMenuElement extends BaseElement {
  onConnect() {
    const year = new Date().getFullYear();
    this.shadowRoot.innerHTML = html`
      <link
        rel="stylesheet"
        href="${import.meta.resolve("../../lib/2bit-ui.css")}"
      />
      <link rel="stylesheet" href="${import.meta.resolve("./np-menu.css")}" />
      <dialog class="bit-root">
        <form method="dialog">
          <h2>Settings</h2>
          <label class="flex-column">
            <span>Theme</span>
            <select class="bit-select" name="theme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label class="flex-column">
            <span>Favicon</span>
            <select class="bit-select" name="favicon">
              <option value="default">Default</option>
              <option value="white">White</option>
              <option value="black">Black</option>
              <option value="green">Green</option>
            </select>
          </label>
          <label class="flex-column">
            <span>Volume</span>
            <select class="bit-select" name="volume">
              <option value="low">Low</option>
              <option value="medium">White</option>
              <option value="high">High</option>
            </select>
          </label>
          <p>
            Whisper font &copy; ${year}
            <a class="bit-link" href="https://www.froyotam.info/">Froyo Tam</a>
          </p>
          <p>
            Code &amp; images &copy; ${year}
            <a class="bit-link" href="https://www.wavebeem.com">Sage Fennel</a>
          </p>
          <div class="flex-right">
            <button class="bit-button">Close</button>
          </div>
        </form>
      </dialog>
    `;
    this.shadowRoot.addEventListener("change", this);
  }

  onDisconnect() {
    this.shadowRoot.removeEventListener("change", this);
  }

  handleEvent(event) {
    const { name, value } = event.target;
    this.shadowRoot.dispatchEvent(
      this.createCustomEvent("np-menu-option-change", { name, value })
    );
  }

  show() {
    this.#dialog.showModal();
  }

  get #dialog() {
    return this.shadowRoot.querySelector("dialog");
  }
}

customElements.define("np-menu", NpMenuElement);
