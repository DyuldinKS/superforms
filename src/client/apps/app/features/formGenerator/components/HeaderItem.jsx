import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

const contextTypes = {
  selectItem: PropTypes.func.isRequired,
};

class HeaderItem extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { selectItem } = this.context;
    selectItem('header');
  }

  render() {
    const { title } = this.props;

    return (
      <div className="form-header" onClick={this.handleClick}>
        <div className="header-item">
          <div className="header-item-title">{title}</div>
          <div className="header-item-type">Заголовок</div>
        </div>
      </div>
    );
  }
}

HeaderItem.propTypes = propTypes;
HeaderItem.defaultProps = defaultProps;
HeaderItem.contextTypes = contextTypes;

export default HeaderItem;
