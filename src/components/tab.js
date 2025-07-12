import {FeyElement} from "../classes/FeyElement.js";
import {toNiceName} from "../util/toNiceName.js";
import {safeEval} from "./eval.js";
import {parseFeyScript} from "../util/parseFeyScript.js";
import {flattenIndentedString} from "../util/flattenIndentString.js";
import {marked} from "marked";
import {extractFrontmatter} from "../util/extractFrontmatter.js";
import yaml from "yaml";

export class FeyTabs extends FeyElement {
    constructor() {
        super();
        this.active = 0;
    }
    connectedCallback() {
        this.buttons = this.querySelectorAll('.tab-buttons button');
        this.tabs = this.querySelectorAll('.tab');
        this.update(0);

        this.buttons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.update(index);
            });
        });

        this.tabs.forEach((tab) => tab.innerHTML = marked.parse(tab.innerHTML));
    }

    update(active) {
        this.active = active;
        this.buttons.forEach((btn) => btn.classList.remove('active'));
        this.tabs.forEach((tab) => tab.classList.remove('active'));
        this.buttons[active].classList.add('active');
        this.tabs[active].classList.add('active');
    }
}

customElements.define('fey-tabs', FeyTabs);
