import {FeyElement} from "../classes/FeyElement.js";
import {toNiceName} from "../util/toNiceName.js";
import {safeEval} from "./eval.js";
import {parseFeyScript} from "../util/parseFeyScript.js";
import {flattenIndentedString} from "../util/flattenIndentString.js";
import {marked} from "marked";
import {extractFrontmatter} from "../util/extractFrontmatter.js";
import yaml from "yaml";

export class FeyImage extends FeyElement {
    constructor() {
        super();
    }
    connectedCallback() {
        let src = this.getAttribute('src');
        let [url, params] = src.split('?');
        console.log(url, params);
        this.src = url;

        const obj = {};
        if(params) {
            params = params.split('&');
            params.forEach((param) => {
                const split = param.split('=');
                obj[split[0]] = split[1];
            });
        }

        this.aspectRatio = obj.aspectRatio || 'auto';
        this.width = obj.width;
        this.height = obj.height;
        this.focus = obj.focus || 'center';
        console.log(obj);
        this.render();
    }

    async render() {
        this.innerHTML = `<div class="crop" style="${this.width ? `width:${this.width};` : ''} ${this.height ? `height: ${this.height};` :''} aspect-ratio: ${this.aspectRatio || 'auto'}">
    <img src="${this.src}" style="object-position: ${this.focus}">
</div>`;
    }
}

customElements.define('fey-image', FeyImage);
