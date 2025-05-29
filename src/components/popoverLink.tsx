import { Popover } from 'react-tiny-popover'
import {useContext, useState} from "react";
import {renderMDX} from "../util/renderMDX.tsx";
import {Context} from "../Context.ts";
import {Await} from "./Await.tsx";
import styles from "./popoverLink.module.css";

export const PopoverLink = ({text, markdown}) => {
    const {data, onChange, onDiceRoll, eventTarget, resolveImport} = useContext(Context);
    const [isOpen, setIsOpen] = useState(false);

    const clickHandler = (e) => {
        e.preventDefault();
        setIsOpen(true);
    };

    return <Popover
        isOpen={isOpen}
        positions={['top', 'bottom', 'right', 'left']}
        content={<div className={styles.popover}><Await promise={renderMDX(markdown, data, resolveImport)} /></div>}
        onClickOutside={() => setIsOpen(false)}
        reposition={true}
    >
        <a href="#" onClick={clickHandler}>{text}</a>
    </Popover>
}
