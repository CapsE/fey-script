export class FocusManager extends EventTarget {
    public focusedElement: HTMLElement|null;
    constructor() {
        super();
        this.focusedElement = null;
    }
}
