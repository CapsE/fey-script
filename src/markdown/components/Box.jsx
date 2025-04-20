import PropTypes from 'prop-types';
import styles from './Box.module.css';

export const Box = ({children, background, width='100%', className}) => {
    return <div className={`${styles.box} ${className || ''}`} style={{background: background, width}}>
        {children}
    </div>;
};

Box.propTypes = {
    children: PropTypes.node,
    background: PropTypes.string,
    width: PropTypes.string,
    className: PropTypes.string,
};
