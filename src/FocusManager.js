export class FocusManager extends EventTarget {
    activeTabs = {}

    constructor() {
        super()
        this.focusedElement = null
        this.activeTabs = {}
    }
}
