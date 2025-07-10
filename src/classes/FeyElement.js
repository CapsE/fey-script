import {FeyViewer} from "../viewer.js";

export class FeyElement extends HTMLElement {
    constructor() {
        super();

        let current = this.parentElement;
        while (current && !(current instanceof FeyViewer)) {
            current = current.parentElement;
        }
        if (current) {
            // Found the parent component
            this.viewer = current;
        }
    }

    replaceImages() {
        this.innerHTML = this.innerHTML.replace(
            /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi,
            (_, src) => `<fey-image src="${src}"></fey-image>`
        );
    }
}
