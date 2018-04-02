import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import makeSortableInwardItem from './makeSortableInwardItem';

const propTypes = {
  item: PropTypes.object.isRequired,
  draggable: PropTypes.bool,
  dragging: PropTypes.bool,
};

const defaultProps = {
  draggable: false,
  dragging: false,
};

function FormItemSample(props) {
  const {
    connectDragSource,
    draggable,
    dragging,
    item,
  } = props;

  const className = classNames({
    'form-item-sample': true,
    draggable,
    dragging,
  });

  return connectDragSource(
    <div className={className}>
      {item.name}
    </div>
  );
}

FormItemSample.propTypes = propTypes;
FormItemSample.defaultProps = defaultProps;

export default makeSortableInwardItem(FormItemSample);
