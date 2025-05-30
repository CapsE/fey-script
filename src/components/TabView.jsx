import React, { useContext, useState } from "react"
import styles from "./TabView.module.css"
import { Context } from "../Context.js"
import { Await } from "./Await.jsx"
import { renderMDX } from "../util/renderMDX.jsx"

export const TabView = ({ tabs, key }) => {
    const { data, resolveImport, eventTarget } = useContext(Context)
    const [active, setActive] = useState(eventTarget.activeTabs[key] || 0)

    const onSwitchActive = index => {
        setActive(index)
        eventTarget.activeTabs[key] = index
    }

    return (
        <div className={styles.tabview}>
            <div className={styles["tab-buttons"]}>
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={index === active ? styles.active : ""}
                        onClick={() => onSwitchActive(index)}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>
            <div className={styles.tabContent}>
                <Await promise={renderMDX(tabs[active].content, data, resolveImport)} />
            </div>
        </div>
    )
}

export const Tab = ({ children }) => {
    return <div>{children}</div>
}
