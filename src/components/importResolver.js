import {FeyElement} from "../classes/FeyElement.js";
import {feyscriptImageRaplace} from "../util/feyscriptToHTML.js";
import {parseFeyScript} from "../util/parseFeyScript.js";
import {parse} from "yaml";

export class FeyImportResolver extends FeyElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.src = this.getAttribute('src');
        this.loadFile();
    }

    async loadFile() {
        let content = await this.viewer.resolveImports(this.src);
        if(this.src.endsWith('.yml')) {
            try {
                content = parse(content);
                this.viewer.setData(content);
            } catch (e) {
                console.warn(e);
            }
            return;
        }
        content = await parseFeyScript(content);
        this.innerHTML = feyscriptImageRaplace(content);
    }
}

customElements.define('fey-import-resolver', FeyImportResolver);
