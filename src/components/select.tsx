import {useContext, useState} from "react";
import {Context} from "../Context.ts";
import styles from "./input.module.css";
import {toNiceName} from "../util/toNiceName";

export const Select = ({name, label, options, value, id, ...other}) => {
    const {data, onChange, eventTarget} = useContext(Context);
    let innerValueInitial = '';

    if (data[name] || data[name] === 0) {
        innerValueInitial = data[name];
    } else if (value) {
        innerValueInitial = value;
    }
    const [innerValue, setInnerValue] = useState(innerValueInitial);

    const changeHandler = (e) => {
        setInnerValue(e.target.value);
    };

    const blurHandler = (e) => {
        eventTarget.focusedElement = null;
        setTimeout(() => {
            onChange({
                ...data,
                [name]: innerValue
            });
        }, 0);
    }

    return <div className={styles.input}>
        <label>{label ? label : toNiceName(name)}</label>
        <select
            id={name + '_' + id}
            onChange={changeHandler}
            onBlur={blurHandler}
            onFocus={() => eventTarget.focusedElement = name + '_' + id}
            value={innerValue}
            {...other}
        >
            <option value="" />
            {options.map((o) => <option value={o}>{toNiceName(o)}</option>)}
        </select>
    </div>;
};
