import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumb from 'shared/ui/breadcrumb';

const propTypes = {};

const defaultProps = {};

function NavBreadcrumb(props) {
  return (
    <div className="nav-breadcrumb-outer">
      <div className="container">
        <Breadcrumb {...props} className="nav-breadcrumb" />
      </div>
    </div>
  );
}

NavBreadcrumb.propTypes = propTypes;
NavBreadcrumb.defaultProps = defaultProps;

export default NavBreadcrumb;
