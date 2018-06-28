import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import { SAMPLE } from '../utils/dndTypes';

const propTypes = {
  insertIndex: PropTypes.number.isRequired,
  getDragIndex: PropTypes.func.isRequired,
  setDragIndex: PropTypes.func.isRequired,
  // from DnD
  connectDropTarget: PropTypes.func.isRequired,
};

const defaultProps = {};

function InsertZone(props) {
  const { connectDropTarget } = props;

  return connectDropTarget(
    <div className="insert-zone">
      Переместите вопрос с панели справа для добавления
    </div>
  );
}

InsertZone.propTypes = propTypes;
InsertZone.defaultProps = defaultProps;

const allowedSources = SAMPLE;

const target = {
  hover(props) {
    const { insertIndex, getDragIndex, setDragIndex } = props;
    if (getDragIndex() === insertIndex) return;
    setDragIndex(insertIndex);
  },
};

function collect(connect) {
  return {
    connectDropTarget: connect.dropTarget(),
  };
}

export default DropTarget(allowedSources, target, collect)(InsertZone);
