import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  condition: PropTypes.bool,
  children: PropTypes.node,
};

const defaultProps = {
  condition: false,
  children: null,
};

function RenderIf(props) {
  const { condition, children } = props;

  if (condition === true) {
    return children;
  }

  return null;
}

RenderIf.propTypes = propTypes;
RenderIf.defaultProps = defaultProps;

export default RenderIf;
