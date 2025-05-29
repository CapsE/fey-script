import { FC } from 'react';

type DiceRollResult = {
    result: {
        output: string;
        // ggf. weitere Felder ergänzen
    };
    // ggf. weitere Felder ergänzen
};

export interface ViewerProps {
    content: string;
    className?: string;
    data: object;
    onClick?: () => void;
    onChange?: (value: object) => void;
    onDiceRoll?: (value: DiceRollResult) => void;
    resolveImport?: (path: string) => string;
}

export const Viewer: FC<ViewerProps>;
