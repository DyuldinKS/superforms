import React from 'react';
import PropTypes from 'prop-types';
import { Nav, NavItem } from 'reactstrap';
import { connect } from 'react-redux';
import { Link } from 'shared/router/components';
import * as routerModule from 'shared/router/redux';

const propTypes = {
  orgId: PropTypes.string.isRequired,
};

const defaultProps = {};

function HeaderNavigation(props) {
  const { orgId } = props;

  return (
    <nav className="app-header-navigation">
      <Nav>
        <NavItem>
          <Link
            className="nav-link"
            to={`/org/${orgId}`}
          >
            Моя организация
          </Link>
        </NavItem>
        <NavItem>
          <Link
            className="nav-link"
            to="/form"
          >
            Форма
          </Link>
        </NavItem>
      </Nav>
    </nav>
  );
}

HeaderNavigation.propTypes = propTypes;
HeaderNavigation.defaultProps = defaultProps;

function mapStateToProps(state) {
  const { pathname } = routerModule.selectors.getStore(state);

  return {
    pathname,
  };
}

export default connect(mapStateToProps, null)(HeaderNavigation);
