import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { locales as typeLocales } from 'shared/form/utils/inputTypes';
import makeSortableItem from './makeSortableItem';

const propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  onDuplicate: PropTypes.func,
  onRemove: PropTypes.func,
  reordering: PropTypes.bool,
  // from dnd
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  draggable: PropTypes.bool,
  dragging: PropTypes.bool,
};

const defaultProps = {
  onSelect: () => {},
  onDuplicate: () => {},
  onRemove: () => {},
  reordering: false,
  // from DnD
  connectDragSource: n => n,
  connectDropTarget: n => n,
  draggable: false,
  dragging: false,
};

export class InputItem extends PureComponent {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleDuplicate = this.handleDuplicate.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  handleClick() {
    const { id, onSelect } = this.props;
    onSelect(id);
  }

  handleDuplicate(event) {
    event.stopPropagation();
    const { id, onDuplicate } = this.props;
    onDuplicate(id);
  }

  handleRemove(event) {
    event.stopPropagation();
    const { id, onRemove } = this.props;
    onRemove(id);
  }

  render() {
    const {
      index,
      item,
      reordering,
      // from DnD
      connectDragSource,
      connectDropTarget,
      draggable,
      dragging,
    } = this.props;
    const { title, type } = item;

    const hidden = reordering && dragging;
    const className = classNames({
      'input-item': true,
      hidden,
      draggable,
      dragging,
    });

    return connectDragSource(connectDropTarget(
      <div className={className} onClick={this.handleClick}>
        <div className="input-item-title">{`${index}. ${title || ''}`}</div>
        <div className="input-item-type">{typeLocales[type]}</div>
        <div className="input-item-options">
          <button
            className="icon"
            onClick={this.handleDuplicate}
          >
            D
          </button>
          <button
            className="icon"
            onClick={this.handleRemove}
          >
            R
          </button>
        </div>
      </div>
    ));
  }
}

InputItem.propTypes = propTypes;
InputItem.defaultProps = defaultProps;

export default makeSortableItem(InputItem);
