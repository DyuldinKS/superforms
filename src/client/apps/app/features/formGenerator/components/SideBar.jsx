import React from 'react';
import PropTypes from 'prop-types';
import BuildingBlock from './BuildingBlock';

const propTypes = {};

const defaultProps = {};

const blocks = [
  {
    name: 'Короткий ответ',
  },
  {
    name: 'Число',
  },
  {
    name: 'Выбор из списка',
  },
  {
    name: 'Время',
  },
  {
    name: 'Дата',
  },
];

function SideBar(props) {
  const {
    findItem,
    moveItem,
    removeItem,
  } = props;

  return (
    <div className="form-generator-side-bar">
      {
        blocks.map((block, blockId) => (
          <BuildingBlock
            item={block}
            key={blockId}
            moveItem={moveItem}
            findItem={findItem}
            removeItem={removeItem}
          />
        ))
      }
    </div>
  );
}

SideBar.propTypes = propTypes;
SideBar.defaultProps = defaultProps;

export default SideBar;
