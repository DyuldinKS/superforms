import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import makeSortableInwardItem from './makeSortableInwardItem';

const propTypes = {
  title: PropTypes.string.isRequired,
  draggable: PropTypes.bool,
  dragging: PropTypes.bool,
};

const defaultProps = {
  draggable: false,
  dragging: false,
};

function CollectionSample(props) {
  const {
    connectDragSource,
    draggable,
    dragging,
    title,
  } = props;

  const className = classNames({
    'form-item-sample': true,
    draggable,
    dragging,
  });

  return connectDragSource(
    <div className={className}>
      {title}
    </div>
  );
}

CollectionSample.propTypes = propTypes;
CollectionSample.defaultProps = defaultProps;

export default makeSortableInwardItem(CollectionSample);
