import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import makeSortableItem from './makeSortableItem';

const propTypes = {
  id: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
  dragItemId: PropTypes.string,
};

const defaultProps = {
  dragItemId: null,
};

function FormItemBlock(props) {
  const {
    connectDragSource,
    connectDropTarget,
    draggable,
    id,
    item,
    dragItemId,
  } = props;

  const className = classNames({
    'form-item-block': true,
    draggable,
    dragging: dragItemId === id,
  });

  return connectDragSource(
    connectDropTarget(
      <div className={className}>
        {item.name}
      </div>
    )
  );
}

FormItemBlock.propTypes = propTypes;
FormItemBlock.defaultProps = defaultProps;

export default makeSortableItem(FormItemBlock);
