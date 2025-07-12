import {FeyElement} from "../classes/FeyElement.js";
import {toNiceName} from "../util/toNiceName.js";

export class FeySelect extends FeyElement {
    constructor() {
        super();
        if(FeySelect.count) {
            this.id = FeySelect.count++;
        } else {
            this.id = 1;
            FeySelect.count = 1;
        }
    }
    connectedCallback() {
        this.key = this.getAttribute('key');
        this.label = this.getAttribute('label') || toNiceName(this.key);
        this.options = JSON.parse(this.getAttribute('options').replaceAll("'", '"'));
        this.viewer.addWatcher(this.key, this.updateInputValue.bind(this));
        this.render();
    }

    updateInputValue(value) {
        if(!this.input) return;
        this.input.value = value;
    }

    render() {
        const label = document.createElement('label');
        label.setAttribute('for', `select-${FeySelect.count}`);
        label.innerText = this.label;

        this.input = document.createElement('select');
        this.input.id = `select-${FeySelect.count}`;
        this.input.value = this.viewer.data[this.key] || this.getAttribute('value');
        this.input.addEventListener('change', (e) => {
            this.viewer.data[this.key] = e.target.value;
        });

        const ele =  document.createElement('option');
        ele.innerText = '';
        ele.value= '';
        this.input.appendChild(ele);

        this.options.forEach((option) => {
           const ele =  document.createElement('option');
           ele.innerText = option;
           ele.value= option;
           this.input.appendChild(ele);
        });

        const wrapper = document.createElement('div');
        wrapper.classList.add('input-wrapper');

        wrapper.appendChild(label);
        wrapper.appendChild(this.input);
        this.appendChild(wrapper);
    }
}

customElements.define('fey-select', FeySelect);
