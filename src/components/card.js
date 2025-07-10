import {FeyElement} from "../classes/FeyElement.js";
import {toNiceName} from "../util/toNiceName.js";
import {safeEval} from "./eval.js";
import {parseFeyScript} from "../util/parseFeyScript.js";
import {flattenIndentedString} from "../util/flattenIndentString.js";
import {marked} from "marked";
import {extractFrontmatter} from "../util/extractFrontmatter.js";
import yaml from "yaml";

export class FeyCard extends FeyElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.import = this.getAttribute('import');
        this.render();
    }

    async render() {
        this.content = await this.viewer.resolveImports(this.import);
        let data = {};

        if(this.import.endsWith('.yml')) {
            console.log(this.content);
            data = yaml.parse(this.content);
        } else {
            const {frontMatterData} = extractFrontmatter(this.content);
            data = {
                img: frontMatterData.img,
                title: frontMatterData.title,
                description: frontMatterData.description,
                link: this.import
            };

            if(!data.img) {
                const regex = /!\[.*?\]\((.*?)\)/;
                const match = this.content.match(regex);
                data.img =  match?.[1] || null;
            }
            if(!data.title) {
                const regex = /(#{1,6})\s+(.*)/m;
                const match = this.content.match(regex);
                data.title = match?.[2] || null;
            }
        }

        const feyScript = data.description ? await parseFeyScript(flattenIndentedString(data.description), this.viewer.resolveImports) : '';
        this.innerHTML = marked.parse(flattenIndentedString(`![image](${data.img})
        ## ${data.title}
        ${feyScript}`));
        this.replaceImages();
    }
}

customElements.define('fey-card', FeyCard);
