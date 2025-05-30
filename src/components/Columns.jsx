import React from "react"
import { Await } from "./Await"
import { renderMDX } from "../util/renderMDX"

const Columns = ({ value = "", context = {} }) => {
    return (
        <div style={{ columnCount: 2 }}>
            <Await promise={renderMDX(value, context, () => "")} />
        </div>
    )
}

export default Columns
