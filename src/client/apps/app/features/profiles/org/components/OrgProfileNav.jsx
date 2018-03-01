import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Nav, NavItem } from 'reactstrap';
import { Link } from 'shared/router/components';

const propTypes = {
  baseUrl: PropTypes.string,
  subpath: PropTypes.string,
};

const defaultProps = {
  baseUrl: '',
  subpath: '',
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
    const {
      baseUrl,
    } = this.props;

    return (
      <Nav tabs className="app-profile-nav">
        <NavItem>
          <Link
            className={this.getClassName('/info')}
            to={`${baseUrl}/info`}
          >
            Информация
          </Link>
        </NavItem>
        <NavItem>
          <Link
            className={this.getClassName('/users')}
            to={`${baseUrl}/users`}
          >
            Пользователи
          </Link>
        </NavItem>
        <NavItem>
          <Link
            className={this.getClassName('/orgs')}
            to={`${baseUrl}/orgs`}
          >
            Организации
          </Link>
        </NavItem>
        <NavItem>
          <Link
            className={this.getClassName('/settings')}
            to={`${baseUrl}/settings`}
          >
            Настройки
          </Link>
        </NavItem>
      </Nav>
    );
  }
}

ProfileNavigation.propTypes = propTypes;
ProfileNavigation.defaultProps = defaultProps;

export default ProfileNavigation;
