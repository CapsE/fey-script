import React, {ChangeEvent} from 'react';
import {toNiceName} from '../util/toNiceName.js';
import PropTypes from 'prop-types';
import {useContext, useState} from 'react';
import {Context} from "../Context";
import styles from './input.module.css';
import {InputProps} from "../util/renderMDX.tsx";

export const Input: React.FC<InputProps> = ({name, label, type, value, id, ...other}) => {
    const {data, onChange, eventTarget} = useContext(Context);

    // Determine initial value type
    let innerValueInitial: string | number = '';
    if (data[name] !== undefined) {
        innerValueInitial = type === 'number' ? Number(data[name]) : String(data[name]);
    } else if (value !== undefined) {
        innerValueInitial = type === 'number' ? Number(value) : String(value);
    }

    const [innerValue, setInnerValue] = useState<string | number>(innerValueInitial);

    const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        if (type === 'number') {
            const v = e.target.value === '' ? '' : Number(e.target.value);
            if (v === '' || isNaN(v)) {
                setInnerValue('');
            } else if (other.max !== undefined && v > other.max) {
                setInnerValue(other.max);
            } else {
                setInnerValue(v);
            }
        } else {
            setInnerValue(e.target.value);
        }
    };

    const blurHandler = () => {
        eventTarget.focusedElement = null;
        onChange({
            ...data,
            [name]: type === 'number'
                ? (innerValue === '' ? '' : Number(innerValue))
                : innerValue
        });
    }

    const elements = [];
    if (type === 'checkmarks') {
        for (let i = 0; i < other.max; i++) {
            elements.push(<input
                key={`checkmarks-${i}`}
                type="checkbox"
                checked={i < Number(innerValue)}
                onChange={(e) => {
                    let v = e.target.checked ? Number(innerValue) + 1 : Number(innerValue) - 1;
                    setInnerValue(v);
                    eventTarget.focusedElement = null;
                    onChange({
                        ...data,
                        [name]: v
                    });
                }}
            />);
        }
    }

    return <div className={styles.input}>
        <label htmlFor={name + '_' + id}>{label ? label : toNiceName(name)}</label>
        {type === 'checkmarks' ? <div className={styles.checkmarks}>
                {elements}
            </div>
            : <input
                id={name + '_' + id}
                onChange={changeHandler}
                onBlur={blurHandler}
                onFocus={() => eventTarget.focusedElement = name + '_' + id}
                type={type ? type : 'text'}
                value={innerValue === undefined ? '' : String(innerValue)}
                {...other}
            />}
        {other.max && type !== 'checkmarks' ? <div className={styles.maxDisplay}>/{other.max}</div> : null}
    </div>;
};

Input.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    type: PropTypes.string,
};
