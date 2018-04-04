import React from 'react';
import PropTypes from 'prop-types';
import SortableList from './SortableList';

const propTypes = {
  order: PropTypes.array,
};

const defaultProps = {
  order: [],
};

function WorkingPane(props) {
  const { order } = props;

  return (
    <SortableList
      order={order}
    />
  );
}

WorkingPane.propTypes = propTypes;
WorkingPane.defaultProps = defaultProps;

export default WorkingPane;
