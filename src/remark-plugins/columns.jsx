import PropTypes from 'prop-types';

export const Cols = ({children, cols=2}) => {
    return <div style={{columnCount: cols}}>
        {children}
    </div>;
};

Cols.propTypes = {
    children: PropTypes.node,
    cols: PropTypes.number,
};
