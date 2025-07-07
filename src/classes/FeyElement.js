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
}
