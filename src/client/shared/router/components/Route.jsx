/**
 * This component will render only if matches web page location
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import matchPath from '../utils/matchPath';
import * as routerModule from '../redux';

const propTypes = {
  // Path to match
  path: PropTypes.string.isRequired,
  // May pathname had subpath and match
  exact: PropTypes.bool,
  // Component to render if path succeed
  component: PropTypes.func.isRequired,
  // Router redux state, that contains current page location
  location: PropTypes.object.isRequired,
};

const defaultProps = {
  exact: false,
};

class Route extends Component {
  constructor(props) {
    super(props);

    const { location, path, exact } = props;
    const { pathname } = location;

    this.state = {
      match: matchPath(pathname, path, exact),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      match: matchPath(
        nextProps.location.pathname,
        nextProps.path,
        nextProps.exact,
      ),
    });
  }

  render() {
    if (!this.state.match) {
      return null;
    }

    const RenderComponent = this.props.component;

    return (
      <RenderComponent
        match={this.state.match}
        location={this.props.location}
      />
    );
  }
}

Route.propTypes = propTypes;
Route.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    location: routerModule.selectors.getStore(state),
  };
}

export default connect(mapStateToProps)(Route);
