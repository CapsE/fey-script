import { createContext } from "react"

export const Context = createContext({
    data: {},
    onChange: () => {},
    resolveImport: () => "",
    eventTarget: {
        focusedElement: null,
        activeTabs: {}
    }
})
