import {FeyElement} from "../classes/FeyElement.js";
import {toNiceName} from "../util/toNiceName.js";

export class FeyRollable extends FeyElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.notation = this.getAttribute('notation');
        const a = document.createElement('a');
        a.setAttribute('href', '#');
        a.innerText = this.notation;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            this.viewer.rollDice(this.notation);
        });
        this.appendChild(a);
    }
}

customElements.define('fey-rollable', FeyRollable);
