import {FeyElement} from "../classes/FeyElement.js";
import {marked} from "marked";

export class FeyGrid extends FeyElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.content = this.innerHTML;
        this.grid = this.getAttribute('grid');
        let cols = this.grid.split('-').join('fr ') + 'fr';
        this.style.gridTemplateColumns = cols;
    }
}

customElements.define('fey-grid', FeyGrid);
