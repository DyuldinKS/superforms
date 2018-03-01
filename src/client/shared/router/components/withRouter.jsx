/**
 * Implementing single page next-prev button behaviour
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as routerModule from '../redux';

export default function withRouter(WrappedComponent) {
  const propTypes = {
    // from Redux
    returnTo: PropTypes.func.isRequired,
  };

  const defaultProps = {};

  class WithRouter extends Component {
    constructor(props) {
      super(props);

      this.handlePopState = this.handlePopState.bind(this);
    }

    componentDidMount() {
      window.addEventListener('popstate', this.handlePopState);
    }

    componentWillUnmount() {
      window.removeEventListener('popstate', this.handlePopState);
    }

    handlePopState(event) {
      const url = new URL(window.location);

      this.props.returnTo(
        String(url),
        event.state,
      );
    }

    render() {
      const {
        returnTo,
        ...props
      } = this.props;

      return (
        <WrappedComponent {...props} />
      );
    }
  }

  const wrappedComponentName = WrappedComponent.displayName
    || WrappedComponent.name
    || 'Component';

  WithRouter.displayName = `withRouter(${wrappedComponentName})`;
  WithRouter.propTypes = propTypes;
  WithRouter.defaultProps = defaultProps;

  const mapDispatchToProps = {
    returnTo: routerModule.actions.returnTo,
  };

  return connect(null, mapDispatchToProps)(WithRouter);
}
