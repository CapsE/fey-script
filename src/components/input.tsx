import {toNiceName} from '../util/toNiceName.js';
import PropTypes from 'prop-types';
import {useContext, useEffect, useState} from 'react';
import {Context} from "../Context.js";

export const Input = ({name, label, type, value, id, ...other}) => {
    const {data, onChange, eventTarget} = useContext(Context);
    let innerValueInitial = '';

    if (data[name]) {
        innerValueInitial = data[name];
    } else if (value) {
        innerValueInitial = value;
    }
    const [innerValue, setInnerValue] = useState(innerValueInitial);

    useEffect(() => {
        data[name] = data[name] || innerValue;
    }, []);

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

    return <div>
        <label>{label ? label : toNiceName(name)}</label>
        <input
            id={name + '_' + id}
            onChange={changeHandler}
            onBlur={blurHandler}
            onFocus={() => eventTarget.focusedElement = name + '_' + id}
            type={type ? type : 'text'}
            value={innerValue}
            {...other}
        />
    </div>;
};

Input.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    type: PropTypes.string,
};
