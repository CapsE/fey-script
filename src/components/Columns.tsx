import React from "react";
import { Await } from "./Await";
import { renderMDX, WrapperProps } from "../util/renderMDX";

const Columns: React.FC<WrapperProps> = ({ value = "", context = {} }) => {
    return (
        <div style={{ columnCount: 2 }}>
            <Await promise={renderMDX(value, context, () => "")} />
        </div>
    );
};

export default Columns;