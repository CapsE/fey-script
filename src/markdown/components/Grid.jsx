import PropTypes from 'prop-types';
import styles from './Grid.module.css';

export const Grid = ({children}) => {
    return <div className={styles.grid} style={{gridTemplateColumns: '1fr 1fr'}}>
        {children}
    </div>;
};

export const Grid3 = ({children}) => {
    return <div className={styles.grid} style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
        {children}
    </div>;
};

Grid3.propTypes = {
    children: PropTypes.node,
};

export const Grid4 = ({children}) => {
    return <div className={styles.grid} style={{gridTemplateColumns: '1fr 1fr 1fr 1fr'}}>
        {children}
    </div>;
};

Grid4.propTypes = {
    children: PropTypes.node,
};

