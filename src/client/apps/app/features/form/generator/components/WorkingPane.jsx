import React from 'react';
import PropTypes from 'prop-types';
import HeaderItem from './HeaderItem';
import SortableList from './SortableList';

const propTypes = {
  title: PropTypes.string,
  order: PropTypes.array,
  selectedItem: PropTypes.string,
};

const defaultProps = {
  title: '',
  order: [],
  selectedItem: null,
};

function WorkingPane(props) {
  const {
    title,
    order,
    selectedItem,
  } = props;

  return (
    <div className="form-generator-working-pane">
      <HeaderItem
        title={title}
      />

      <SortableList
        order={order}
        selectedItem={selectedItem}
      />
    </div>
  );
}

WorkingPane.propTypes = propTypes;
WorkingPane.defaultProps = defaultProps;

export default WorkingPane;
