/**
 * Enhances standart HTML link to single page link
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { actions } from '../redux';
import getURLFromParts from '../utils/getURLFromParts';

const propTypes = {
  active: PropTypes.bool,
  to: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]).isRequired,
  className: PropTypes.string,
  stateObj: PropTypes.object,
  children: PropTypes.node,
  type: PropTypes.oneOf(['redirect', 'replace']),
  onClick: PropTypes.func,
  // from Redux
  redirect: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
};

const defaultProps = {
  active: false,
  className: '',
  stateObj: {},
  children: null,
  type: 'redirect',
  onClick: () => {},
};

class Link extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    const {
      to,
      type,
      onClick,
      replace,
      redirect,
      stateObj,
    } = this.props;

    event.preventDefault();
    onClick(event);

    if (type === 'redirect') {
      redirect(to, stateObj);
    } else {
      replace(to, stateObj);
    }
  }

  render() {
    const {
      active,
      className,
      to,
      children,
    } = this.props;

    const href = (typeof to === 'string') ?
      to :
      String(getURLFromParts(to));

    return (
      <a
        href={href}
        className={classNames(className, { active })}
        onClick={this.handleClick}
      >
        {children}
      </a>
    );
  }
}

Link.propTypes = propTypes;
Link.defaultProps = defaultProps;

const mapDispatchToProps = {
  redirect: actions.redirect,
  replace: actions.replace,
};

export default connect(null, mapDispatchToProps)(Link);
