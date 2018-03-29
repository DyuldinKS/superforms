import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import BuildingBlock from './BuildingBlock';

const propTypes = {};

const defaultProps = {};

const target = {
  drop() {},
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

function WorkingPane(props) {
  const {
    items,
    connectDropTarget,
    isOver,
    findItem,
    moveItem,
    removeItem,
  } = props;

  return connectDropTarget(
    <div
      className="form-generator-working-pane"
    >
      {
        items.map((item) => {
          return (
            <BuildingBlock
              item={item}
              key={item.id}
              moveItem={moveItem}
              findItem={findItem}
              removeItem={removeItem}
            />
          )
        })
      }
    </div>
  );
}

WorkingPane.propTypes = propTypes;
WorkingPane.defaultProps = defaultProps;

export default DropTarget('BuildingBlock', target, collect)(WorkingPane);
