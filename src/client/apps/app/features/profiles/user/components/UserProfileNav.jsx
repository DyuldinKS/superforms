/**
 * User profile navigation
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Nav, NavItem } from 'reactstrap';
import { Link } from 'shared/router/components';
import RenderIf from 'shared/helpers/RenderIf';
import ROLES from 'apps/app/shared/redux/users/roles';
import { selectors as sessionQuery } from 'apps/app/shared/redux/session';
import { selectors as userQuery } from 'apps/app/shared/redux/users';

const propTypes = {
  baseUrl: PropTypes.string,
  subpath: PropTypes.string,
  tabsVisibility: PropTypes.object,
};

const defaultProps = {
  baseUrl: '',
  subpath: '',
  tabsVisibility: {},
};

class ProfileNavigation extends Component {
  constructor(props) {
    super(props);
    this.defaultTab = '/info';
  }

  getClassName(linkPath) {
    const { subpath } = this.props;

    return classNames(
      'nav-link',
      {
        active: subpath
          ? subpath.startsWith(linkPath)
          : linkPath === this.defaultTab,
      },
    );
  }

  render() {
    const { baseUrl, tabsVisibility: tv } = this.props;

    return (
      <Nav tabs className="app-profile-nav">
        <RenderIf condition={tv.info}>
          <NavItem>
            <Link
              className={this.getClassName('/info')}
              to={`${baseUrl}/info`}
            >
              Информация
            </Link>
          </NavItem>
        </RenderIf>
        <RenderIf condition={tv.forms}>
          <NavItem>
            <Link
              className={this.getClassName('/forms')}
              to={`${baseUrl}/forms`}
            >
              Формы
            </Link>
          </NavItem>
        </RenderIf>
        <RenderIf condition={tv.settings}>
          <NavItem>
            <Link
              className={this.getClassName('/settings')}
              to={`${baseUrl}/settings`}
            >
              Настройки
            </Link>
          </NavItem>
        </RenderIf>
      </Nav>
    );
  }
}

ProfileNavigation.propTypes = propTypes;
ProfileNavigation.defaultProps = defaultProps;

function mapStateToProps(state, { id: profileId }) {
  const session = sessionQuery.getStore(state);
  const { role } = userQuery.getUserEntity(state, session.userId);

  const isRoot = role === ROLES.ROOT;
  const isAdmin = role === ROLES.ADMIN;
  const isUser = role === ROLES.USER;
  const isSessionUserProfile = session.userId === profileId;

  const profileUser = userQuery.getUserEntity(state, profileId);
  const isProfileWithinSessionOrg = profileUser.orgId === session.orgId;

  const tabsVisibility = {
    info: true,
    forms: isRoot || ((isAdmin || isUser) && isProfileWithinSessionOrg),
    settings: isSessionUserProfile
      || isRoot || (isAdmin && isProfileWithinSessionOrg),
  };

  return {
    tabsVisibility,
  };
}

export default connect(mapStateToProps)(ProfileNavigation);
