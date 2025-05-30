import React from "react"
import { Await } from "./Await.jsx"
import { renderMDX } from "../util/renderMDX.jsx"
import styles from "./grid.module.css"

export const Grid = ({
                         cols = "2",
                         content = "",
                         context = {},
                         resolveImports = () => ""
                     }) => {
    const colArray = cols.split("-")
    let templateCols = ""

    if (colArray.length === 1) {
        templateCols = `repeat(${cols}, 1fr)`
    } else {
        templateCols = colArray.join("fr ") + "fr"
    }
    return (
        <div className={styles.grid} style={{ gridTemplateColumns: templateCols }}>
            <Await promise={renderMDX(content, context, resolveImports)} />
        </div>
    )
}
