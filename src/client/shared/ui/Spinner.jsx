import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  size: PropTypes.oneOf([
    'lg',
    '2x',
    '3x',
    '4x',
    '5x',
  ]),
};

const defaultProps = {
  size: null,
};

function Spinner({ size }) {
  return (
    <i
      className={`fa fa-spinner fa-pulse fa-fw fa-${size}`}
      aria-hidden="true"
    />
  );
}

Spinner.propTypes = propTypes;
Spinner.defaultProps = defaultProps;

export default Spinner;
