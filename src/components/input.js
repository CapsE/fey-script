import {FeyElement} from "../classes/FeyElement.js";
import {toNiceName} from "../util/toNiceName.js";

export class FeyInput extends FeyElement {
    constructor() {
        super();
        if(FeyInput.count) {
            this.id = FeyInput.count++;
        } else {
            this.id = 1;
            FeyInput.count = 1;
        }
    }
    connectedCallback() {
        this.key = this.getAttribute('key');
        this.label = this.getAttribute('label') || toNiceName(this.key);
        this.type = this.getAttribute('type') || 'number';
        this.viewer.addWatcher(this.key, this.updateInputValue.bind(this));
        this.render();
    }

    updateInputValue(value) {
        if(!this.input) return;
        this.input.value = value;
    }

    render() {
        const label = document.createElement('label');
        label.setAttribute('for', `input-${FeyInput.count}`);
        label.innerText = this.label;

        this.input = document.createElement('input');
        this.input.id = `input-${FeyInput.count}`;
        this.input.setAttribute('type', this.type);
        this.input.value = this.viewer.data[this.key] || this.getAttribute('value');
        this.input.addEventListener('change', (e) => {
            this.viewer.data[this.key] = e.target.value;
        });

        const wrapper = document.createElement('div');
        wrapper.classList.add('input-wrapper');

        wrapper.appendChild(label);
        wrapper.appendChild(this.input);
        this.appendChild(wrapper);
    }
}

customElements.define('fey-input', FeyInput);
