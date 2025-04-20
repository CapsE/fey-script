import PropTypes from 'prop-types';

export const If = ({children, check}) => {
    if (check) {
        return <div>
            {children}
        </div>;
    }
    return null;
};

If.propTypes = {
    children: PropTypes.node,
    check: PropTypes.bool,
};
