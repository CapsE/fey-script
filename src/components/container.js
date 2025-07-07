import {FeyElement} from "../classes/FeyElement.js";
import {marked} from "marked";

export class FeyContainer extends FeyElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.content = this.innerHTML;
        this.render();
    }

    async render() {
        this.innerHTML = marked.parse(this.content);
    }
}

customElements.define('fey-container', FeyContainer);
