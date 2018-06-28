import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import makeSortableInwardItem from './makeSortableInwardItem';
import getCollectionSampleIcon from '../utils/getCollectionSampleIcon';

const propTypes = {
  id: PropTypes.string.isRequired,
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
    id,
    title,
  } = props;

  const className = classNames({
    'form-item-sample': true,
    draggable,
    dragging,
  });

  const icon = getCollectionSampleIcon(id);

  return connectDragSource(
    <div className={className}>
      <i className={`icon text-secondary ${icon}`} />
      {title}
    </div>
  );
}

CollectionSample.propTypes = propTypes;
CollectionSample.defaultProps = defaultProps;

export default makeSortableInwardItem(CollectionSample);
