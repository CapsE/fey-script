import React from "react"
import { toNiceName } from "../util/toNiceName.js"
import PropTypes from "prop-types"
import { useContext, useState } from "react"
import { Context } from "../Context"
import styles from "./input.module.css"

export const Input = ({ name, label, type, value, id, ...other }) => {
    const { data, onChange, eventTarget } = useContext(Context)

    if(!name) {
        return null;
    }

    // Determine initial value type
    let innerValueInitial = ""
    if (data[name] !== undefined) {
        innerValueInitial =
            type === "number" ? Number(data[name]) : String(data[name])
    } else if (value !== undefined) {
        innerValueInitial = type === "number" ? Number(value) : String(value)
    }

    const [innerValue, setInnerValue] = useState(innerValueInitial)

    const changeHandler = e => {
        if (type === "number") {
            const v = e.target.value === "" ? "" : Number(e.target.value)
            if (v === "" || isNaN(v)) {
                setInnerValue("")
            } else if (other.max !== undefined && v > other.max) {
                setInnerValue(other.max)
            } else {
                setInnerValue(v)
            }
        } else {
            setInnerValue(e.target.value)
        }
    }

    const blurHandler = () => {
        eventTarget.focusedElement = null
        onChange({
            ...data,
            [name]:
                type === "number"
                    ? innerValue === ""
                        ? ""
                        : Number(innerValue)
                    : innerValue
        })
    }

    const elements = []
    if (type === "checkmarks") {
        for (let i = 0; i < other.max; i++) {
            elements.push(
                <input
                    key={`checkmarks-${i}`}
                    type="checkbox"
                    checked={i < Number(innerValue)}
                    onChange={e => {
                        let v = e.target.checked
                            ? Number(innerValue) + 1
                            : Number(innerValue) - 1
                        setInnerValue(v)
                        eventTarget.focusedElement = null
                        onChange({
                            ...data,
                            [name]: v
                        })
                    }}
                />
            )
        }
    }

    console.log({
        name,
        other
    });
    return (
        <div className={styles.input}>
            <label htmlFor={name + "_" + id}>
                {label ? label : toNiceName(name)}
            </label>
            {type === "checkmarks" ? (
                <div className={styles.checkmarks}>{elements}</div>
            ) : (
                <input
                    id={name + "_" + id}
                    onChange={changeHandler}
                    onBlur={blurHandler}
                    onFocus={() => (eventTarget.focusedElement = name + "_" + id)}
                    type={type ? type : "text"}
                    value={innerValue === undefined ? "" : String(innerValue)}
                    {...other}
                />
            )}
            {other.max && type !== "checkmarks" ? (
                <div className={styles.maxDisplay}>/{other.max}</div>
            ) : null}
        </div>
    )
}

Input.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    type: PropTypes.string
}
