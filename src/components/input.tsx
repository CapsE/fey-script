import {toNiceName} from '../util/toNiceName.js';
import PropTypes from 'prop-types';
import {useContext, useEffect, useState} from 'react';
import {Context} from "../Context.js";
import styles from './input.module.css';

export const Input = ({name, label, type, value, id, ...other}) => {
    const {data, onChange, eventTarget} = useContext(Context);
    let innerValueInitial = '';

    if (data[name] || data[name] === 0) {
        innerValueInitial = data[name];
    } else if (value) {
        innerValueInitial = value;
    }
    const [innerValue, setInnerValue] = useState(innerValueInitial);

    const changeHandler = (e) => {
        if (type === 'number') {
            const v = parseInt(e.target.value);
            if (isNaN(v)) {
                setInnerValue('');
            } else {
                setInnerValue(v);
            }
        } else {
            setInnerValue(e.target.value);
        }
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

    const elements = [];
    if(type === 'checkmarks') {
        for (let i = 0; i < other.max; i++) {
            elements.push(<input
                key={`checkmarks-${i}`}
                type="checkbox"
                checked={i < innerValue}
                onChange={(e) => {
                    let v = e.target.checked ? parseInt(innerValue) + 1 : parseInt(innerValue) - 1;
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
        <label>{label ? label : toNiceName(name)}</label>
        {type === 'checkmarks' ? <div className={styles.checkmarks}>
                {elements}
            </div>
            :<input
            id={name + '_' + id}
            onChange={changeHandler}
            onBlur={blurHandler}
            onFocus={() => eventTarget.focusedElement = name + '_' + id}
            type={type ? type : 'text'}
            value={innerValue}
            {...other}
        />}
    </div>;
};

Input.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    type: PropTypes.string,
};
