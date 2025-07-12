import {FeyElement} from "../classes/FeyElement.js";

export function safeEval(code, context) {
    const keys = Object.keys(context)
    const values = Object.values(context)
    let out;

    try {
        out = Function(...keys, `"use strict"; return (${code})`)(...values)
    } catch (e) {
        console.warn(e.message);
        out = 'x';
    }
    return out;
}

export class FeyEval extends FeyElement {
    connectedCallback() {
        this.expression = this.getAttribute('expression');
        this.viewer.addWatcher('*', this.render.bind(this));
        this.render();
    }

    render() {
        try {
            let code = safeEval(this.expression, this.viewer.data).toString();
            code = code.replaceAll(/(?<![\w\/])((\d+)?d(\d+)(?:k[lh]?\d+)?([+\-*\/]\d+)?[+\-]*)+(?![\w\/])|(?<![\w\/])([+\-]{1,2}\d+)(?![\w\/])/g, (match, inner) => {
                return `<fey-rollable notation="${match}"></fey-rollable>`
            });
            this.innerHTML = code;
        } catch (e) {
            this.innerHTML = 'X';
            console.warn(e.message);
        }

    }
}

customElements.define('fey-eval', FeyEval);
