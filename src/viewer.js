import {marked} from "marked";
import {flattenIndentedString} from "./util/flattenIndentString.js";
import {extractFrontmatter} from "./util/extractFrontmatter.js";
import {parseFeyScript} from "./util/parseFeyScript.js";
import './components/eval.js';
import './components/input.js';
import './components/rollable.js';
import './components/if.js';
import './components/select.js';
import './components/container.js';
import './components/card.js';
import './components/grid.js';
import './components/tab.js';
import './components/image.js';
import {rollDice} from "./util/dice.js";
import styles from './style.css?inline';

async function defaultImportResolver(path) {
    return `Import ${path}`;
}
export class FeyViewer extends HTMLElement {
    constructor() {
        super();
        this.watchers = {};
        this.data = new Proxy({
            $mod: (v) =>
                Math.floor((v - 10) / 2) < 0
                    ? Math.floor((v - 10) / 2)
                    : "+" + Math.floor((v - 10) / 2)
        }, {
            set: (target, prop, value) => {
                if (target[prop] === value) return;
                target[prop] = value;
                if (this.watchers[prop]) {
                    this.watchers[prop].forEach(fn => fn(value));
                }
                if (this.watchers['*']) {
                    this.watchers['*'].forEach(fn => fn(value));
                }
                this.dispatchEvent(new CustomEvent('change', {detail: this.data}));
                return true;
            }
        });
    }
    connectedCallback() {
        let data = this.getAttribute('data');
        this.resolveImports = this.resolveImports || defaultImportResolver;
        if (data) {
            data = JSON.parse(data);
        } else {
            data = {};
        }

        const content = this.innerHTML.replaceAll('&gt;', '>').replaceAll('&lt;', '<');
        const {cleanMDX, frontMatterData} = extractFrontmatter(content);
        this.setData({
            ...frontMatterData,
            ...data
        });
        this.setContent(cleanMDX || '');
    }

    setData(data) {
        Object.keys(data).forEach((key) => {
            this.data[key] = data[key];
        });
    }

    async setContent(content) {
        this.content = content;
        this.watchers = {};
        const feyScript = await parseFeyScript(this.content, this.resolveImports);
        this.innerHTML = `<style>${styles}</style>${marked.parse(feyScript).replace(
            /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi,
            (_, src) => `<fey-image src="${src}"></fey-image>`
        )}`;
    }

    addWatcher(key, fn) {
        if(this.watchers[key]) {
            this.watchers[key].push(fn);
        } else {
            this.watchers[key] = [fn];
        }
    }

    rollDice(notation) {
        const defaultDice = this.getAttribute('defaultDice') || '1d20';
        const result = rollDice(notation, defaultDice);
        this.dispatchEvent(new CustomEvent('onDiceRoll', {detail: result}));
    }
}

customElements.define('fey-viewer', FeyViewer);
