import {useContext, useState} from 'react';
import styles from './TabView.module.css';
import {Viewer} from "../Viewer.jsx";
import {Context} from "../../Context.js";

// <Context.Provider value={{
//     data,
//     onChange,
//     eventTarget,
//     onDiceRoll: diceRollHandler
// }}>

export function TabView({ tabs }) {
    const [active, setActive] = useState(0);
    const {data, onChange, onDiceRoll} = useContext(Context);

    return (
        <div className={styles.tabview}>
            <div className={styles["tab-buttons"]}>
                {tabs.map((tab, i) => (
                    <button
                        key={i}
                        className={i === active ? styles.active : ''}
                        onClick={() => setActive(i)}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                <Viewer
                    data={data}
                    onChange={onChange}
                    content={tabs[active].content}
                    onDiceRoll={(r) => onDiceRoll(r.notation)}
                />
            </div>
        </div>
    );
}

export function Tab({ children }) {
    return <div>{children}</div>;
}
