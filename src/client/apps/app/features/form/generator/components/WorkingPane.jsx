import React from 'react';
import PropTypes from 'prop-types';
import HeaderItem from './HeaderItem';
import SortableList from './SortableList';

const propTypes = {
  title: PropTypes.string,
  order: PropTypes.array,
};

const defaultProps = {
  title: '',
  order: [],
};

function WorkingPane(props) {
  const {
    title,
    order,
  } = props;

  return (
    <div className="form-generator-working-pane">
      <HeaderItem
        title={title}
      />

      <SortableList
        order={order}
      />
    </div>
  );
}

WorkingPane.propTypes = propTypes;
WorkingPane.defaultProps = defaultProps;

export default WorkingPane;
