import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { locales as typeLocales } from 'shared/form/utils/inputTypes';
import makeSortableItem from './makeSortableItem';

const propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  // from dnd
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  draggable: PropTypes.bool,
  dragging: PropTypes.bool,
};

const defaultProps = {
  draggable: false,
  dragging: false,
};

class InputItem extends PureComponent {
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
      connectDragSource,
      connectDropTarget,
      draggable,
      dragging,
      index,
    } = this.props;
    const { title, type } = this.props.item;

    const className = classNames({
      'input-item': true,
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
