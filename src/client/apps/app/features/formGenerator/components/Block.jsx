import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {};

const defaultProps = {};

function Block(props) {
  const { name } = props;
  return (
    <div className="block">
      {name}
    </div>
  );
}

Block.propTypes = propTypes;
Block.defaultProps = defaultProps;

export default Block;
