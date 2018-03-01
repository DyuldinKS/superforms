import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

const defaultProps = {
  children: [],
  className: '',
};

function EntriesListHeader(props) {
  const { children, className } = props;

  return (
    <div className={`entries-list-header ${className}`}>
      {children}
    </div>
  );
}

EntriesListHeader.propTypes = propTypes;
EntriesListHeader.defaultProps = defaultProps;

export default EntriesListHeader;
