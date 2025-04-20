import PropTypes from 'prop-types';

const rollHandler = async (notation) => {
    const event = new CustomEvent('roll', {detail: {
            title: notation,
            notation,
        }});
    window.dispatchEvent(event);
};

export const Rollable = ({value, label, color, onRoll}) => {
    if (value.indexOf('+-') === 0) {
        value = value.replace('+-', '-');
    }
    return <a title={value} href="#" style={{color}} onClick={(e) => {
        e.preventDefault();
        onRoll ? onRoll(value) : rollHandler(value);
    }}>{label || value}</a>;
};

Rollable.propTypes = {
    value: PropTypes.string,
    label: PropTypes.string,
    color: PropTypes.string,
    onRoll: PropTypes.func,
};

export default Rollable;
