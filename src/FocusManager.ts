export class FocusManager extends EventTarget {
    public focusedElement: HTMLElement|null;
    public activeTabs: Record<string, number> = {};

    constructor() {
        super();
        this.focusedElement = null;
        this.activeTabs = {};
    }
}
