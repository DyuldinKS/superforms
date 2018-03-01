/**
 * Wraps multiple Route components to render only first that matched location
 * Actually it renders Route component prop, not Route
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import matchPath from '../utils/matchPath';
import * as routerModule from '../redux';

const propTypes = {
  children: PropTypes.array.isRequired,
  // Router redux state, that contains current page location
  location: PropTypes.object.isRequired,
};

const defaultProps = {};

function Switch(props) {
  const { children, location } = props;
  const { pathname } = location;

  let matchProp;
  let Child;
  React.Children.forEach(children, (element) => {
    if (!matchProp && React.isValidElement(element)) {
      const {
        path,
        exact,
        component,
      } = element.props;

      const match = matchPath(pathname, path, exact);
      if (match) {
        matchProp = match;
        Child = component;
      }
    }
  });

  return matchProp
    ? <Child match={matchProp} location={location} />
    : null;
}

Switch.propTypes = propTypes;
Switch.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    location: routerModule.selectors.getStore(state),
  };
}

export default connect(mapStateToProps)(Switch);
