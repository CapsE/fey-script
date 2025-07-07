import {FeyElement} from "../classes/FeyElement.js";
import {toNiceName} from "../util/toNiceName.js";
import {safeEval} from "./eval.js";
import {parseFeyScript} from "../util/parseFeyScript.js";
import {flattenIndentedString} from "../util/flattenIndentString.js";
import {marked} from "marked";

export class FeyIf extends FeyElement {
    constructor() {
        super();
        this.state = false;
    }
    connectedCallback() {
        this.expression = this.getAttribute('expression');
        this.content = this.innerHTML;
        this.viewer.addWatcher('*', this.evaluate.bind(this));
        this.render();
    }

    evaluate() {
        try {
            let result = safeEval(this.expression, this.viewer.data);
            if(result !== this.state) {
                this.state = result;
                this.render();
            }

            this.state = result;
        } catch (e) {
                this.innerHTML = 'X';
                console.warn(e.message);
        }
    }

    async render() {
        if(!this.state) {
            this.innerHTML = '';
            return;
        }
        const feyScript = await parseFeyScript(flattenIndentedString(this.content), this.viewer.resolveImports);
        this.innerHTML = marked.parse(feyScript);
    }
}

customElements.define('fey-if', FeyIf);
