import {createContext} from "react";

type ContextType = {
    data: Record<string, any>;
    onChange: (value: Record<string, any>) => void;
    onDiceRoll?: (notation: string) => void;
    resolveImport: (path: string) => string;
    eventTarget: {
        focusedElement: string | null;
        activeTabs: Record<string, number>;
    };
};

export const Context = createContext<ContextType>({
    data: {},
    onChange: () => {},
    resolveImport: () => "",
    eventTarget: {
        focusedElement: null,
        activeTabs: {},
    },
});
