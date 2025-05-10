import PropTypes from 'prop-types';
import {useContext} from "react";
import {Context} from "../Context.ts";

export const Rollable = ({value, label, color, onRoll}) => {
    const {onDiceRoll} = useContext(Context);
    if (value.indexOf('+-') === 0) {
        value = value.replace('+-', '-');
    }
    return <a title={value} href="#" style={{color}} onClick={(e) => {
        e.preventDefault();
        onRoll ? onRoll(value) : onDiceRoll(value);
    }}>{label || value}</a>;
};

Rollable.propTypes = {
    value: PropTypes.string,
    label: PropTypes.string,
    color: PropTypes.string,
    onRoll: PropTypes.func,
};

export default Rollable;
