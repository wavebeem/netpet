import { BaseElement, html } from "../base-element.js";

export class NpMenuElement extends BaseElement {
  onConnect() {
    this.shadowRoot.innerHTML = html`
      <link
        rel="stylesheet"
        href="${import.meta.resolve("../../lib/2bit-ui.css")}"
      />
      <link rel="stylesheet" href="${import.meta.resolve("./np-menu.css")}" />
      <dialog class="bit-root">
        <form method="dialog">
          <div>Settings go here</div>
          <button class="bit-button">Close</button>
        </form>
      </dialog>
    `;
    this.shadowRoot.addEventListener("change", this);
  }

  onDisconnect() {
    this.shadowRoot.removeEventListener("change", this);
  }

  handleEvent(event) {
    // TODO: Emit events for each setting to be handled by <np-app>
  }

  show() {
    this.#dialog.showModal();
  }

  get #dialog() {
    return this.shadowRoot.querySelector("dialog");
  }
}

customElements.define("np-menu", NpMenuElement);
