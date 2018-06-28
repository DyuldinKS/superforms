import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Nav, NavItem } from 'reactstrap';
import RenderIf from 'shared/helpers/RenderIf';
import { Link } from 'shared/router/components';
import { selectors as routerQuery } from 'shared/router/redux';
import { selectors as sessionQuery } from 'apps/app/shared/redux/session';
import { selectors as userQuery } from 'apps/app/shared/redux/users';
import ROLES from 'apps/app/shared/redux/users/roles';

const propTypes = {
  isAdmin: PropTypes.bool,
  orgId: PropTypes.number.isRequired,
  pathname: PropTypes.string,
  userId: PropTypes.number.isRequired,
};

const defaultProps = {
  isAdmin: false,
  pathname: '/',
};

function HeaderNavigation(props) {
  const {
    isAdmin,
    orgId,
    pathname,
    userId,
  } = props;

  const isFormsLink = pathname === '/';
  const isProfileLink = pathname === `/user/${userId}`;
  const isAdminLink = !isProfileLink && /\/(org|user)./.test(pathname);

  return (
    <Nav navbar>
      <NavItem active={isFormsLink}>
        <Link
          className="nav-link"
          to="/"
        >
          Формы
        </Link>
      </NavItem>
      <RenderIf condition={isAdmin}>
        <NavItem active={isAdminLink}>
          <Link
            className="nav-link"
            to={`/org/${orgId}`}
          >
            Администрирование
          </Link>
        </NavItem>
      </RenderIf>
      <NavItem className="to-right" active={isProfileLink}>
        <Link
          className="nav-link"
          to={`/user/${userId}`}
        >
          Профиль
        </Link>
      </NavItem>
    </Nav>
  );
}

HeaderNavigation.propTypes = propTypes;
HeaderNavigation.defaultProps = defaultProps;

function mapStateToProps(state) {
  const { pathname } = routerQuery.getStore(state);
  const { userId, orgId } = sessionQuery.getStore(state);
  const { role } = userQuery.getUserEntity(state, userId);
  const isAdmin = role === ROLES.ROOT || role === ROLES.ADMIN;

  return {
    orgId,
    pathname,
    userId,
    isAdmin,
  };
}

export default connect(mapStateToProps, null)(HeaderNavigation);
