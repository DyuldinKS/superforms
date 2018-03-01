import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

const defaultProps = {
  children: null,
  className: null,
};

function PageHeader(props) {
  const { children, className } = props;

  return (
    <div id="page-header" className={className}>
      {children}
    </div>
  );
}

PageHeader.propTypes = propTypes;
PageHeader.defaultProps = defaultProps;

export default PageHeader;
