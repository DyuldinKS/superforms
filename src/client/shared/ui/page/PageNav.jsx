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

function PageNav(props) {
  const { children, className } = props;

  return (
    <div id="page-nav" className={className}>
      {children}
    </div>
  );
}

PageNav.propTypes = propTypes;
PageNav.defaultProps = defaultProps;

export default PageNav;
