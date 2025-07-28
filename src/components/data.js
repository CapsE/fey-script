import {FeyElement} from "../classes/FeyElement.js";
import {marked} from "marked";
import {parse} from "yaml";

export class FeyData extends FeyElement {
    constructor() {
        super();
    }
    connectedCallback() {
        let data;
        try {
            data = this.innerHTML;
            data = decodeURIComponent(data);
            data = parse(data);
            this.viewer.setData(data);
        } catch (e) {
            console.error(e.message);
        }
        this.innerHTML = "";
    }
}

customElements.define('fey-data', FeyData);
