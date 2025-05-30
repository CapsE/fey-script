import React, { useContext } from "react";
import { Context } from "../Context.ts";

type RollableProps = {
    value: string;
    label?: string;
    color?: string;
    onRoll?: (value: string) => void;
};

export const Rollable: React.FC<RollableProps> = ({ value, label, color, onRoll }) => {
    const { onDiceRoll } = useContext(Context);

    if (value.startsWith("+-")) {
        value = value.replace("+-", "-");
    }

    return (
        <a
            title={value}
            href="#"
            style={{ color }}
            onClick={(e) => {
                e.preventDefault();
                onRoll ? onRoll(value) : onDiceRoll?.(value);
            }}
        >
            {label || value}
        </a>
    );
};

export default Rollable;
