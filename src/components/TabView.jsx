import {useContext, useState} from 'react';
import styles from './TabView.module.css';
import {Viewer} from "../markdown/Viewer.jsx";
import {Context} from "../Context.ts";
import {Await} from "./Await.js";
import {renderMDX} from "../util/renderMDX.js";

export function TabView({ tabs, key }) {
    const {data, onChange, onDiceRoll, eventTarget, resolveImport} = useContext(Context);
    const [active, setActive] = useState(eventTarget.activeTabs[key] || 0);

    const onSwitchActive = (i) => {
        setActive(i);
        eventTarget.activeTabs[key] = i;
    }

    return (
        <div className={styles.tabview}>
            <div className={styles["tab-buttons"]}>
                {tabs.map((tab, i) => (
                    <button
                        key={i}
                        className={i === active ? styles.active : ''}
                        onClick={() => onSwitchActive(i)}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>
            <div className={styles.tabContent}>
                <Await promise={renderMDX(tabs[active].content, data, resolveImport)} />
            </div>
        </div>
    );
}

export function Tab({ children }) {
    return <div>{children}</div>;
}
