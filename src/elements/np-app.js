import { BaseElement, html } from "./base-element.js";
import "./np-pet.js";

class NpAppElement extends BaseElement {
  connectedCallback() {
    this.shadowRoot.innerHTML = html`
      <link rel="stylesheet" href="${this.cssURL}" />
      <div class="frame">
        <h1 class="heading">netpet</h1>
        <div class="screen">
          <np-pet></np-pet>
        </div>
      </div>
    `;
  }
}

customElements.define("np-app", NpAppElement);
