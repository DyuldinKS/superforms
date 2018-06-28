import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Nav, NavItem } from 'reactstrap';
import { Link } from 'shared/router/components';
import { selectors as router } from 'shared/router/redux';
import { selectors as session } from 'apps/app/shared/redux/session';

const propTypes = {
  orgId: PropTypes.string.isRequired,
  pathname: PropTypes.string,
  userId: PropTypes.string.isRequired,
};

const defaultProps = {
  pathname: '/',
};

function HeaderNavigation(props) {
  const { orgId, userId, pathname } = props;

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
      <NavItem active={isAdminLink}>
        <Link
          className="nav-link"
          to={`/org/${orgId}`}
        >
          Администрирование
        </Link>
      </NavItem>
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
  const { pathname } = router.getStore(state);
  const { userId, orgId } = session.getStore(state);

  return {
    orgId,
    pathname,
    userId,
  };
}

export default connect(mapStateToProps, null)(HeaderNavigation);
