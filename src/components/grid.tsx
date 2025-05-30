import React from "react";
import {Await} from "./Await.tsx";
import {renderMDX} from "../util/renderMDX.tsx";
import styles from "./grid.module.css";

type GridProps = {
    cols?: string;
    content?: string;
    context?: Record<string, any>;
    resolveImports?: (path: string) => string;
};

export const Grid: React.FC<GridProps> = ({ cols = "2", content = "", context = {}, resolveImports = () => "" }) => {
    const colArray = cols.split("-");
    let templateCols = "";

    if (colArray.length === 1) {
        templateCols = `repeat(${cols}, 1fr)`;
    } else {
        templateCols = colArray.join("fr ") + "fr";
    }
    return (
        <div className={styles.grid} style={{ gridTemplateColumns: templateCols }}>
            <Await promise={renderMDX(content, context, resolveImports)} />
        </div>
    );
};
