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

function Page(props) {
  const { children, className } = props;

  return (
    <div id="page" role="main" className={className}>
      {children}
    </div>
  );
}

Page.propTypes = propTypes;
Page.defaultProps = defaultProps;

export default Page;
