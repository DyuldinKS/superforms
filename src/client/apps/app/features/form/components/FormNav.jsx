import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Nav, NavItem } from 'reactstrap';
import classNames from 'classnames';
import { Link } from 'shared/router/components';
import RenderIf from 'shared/helpers/RenderIf';

import { selectors as sessionQuery } from 'apps/app/shared/redux/session';
import { selectors as formQuery } from 'apps/app/shared/redux/forms';
import { selectors as userQuery } from 'apps/app/shared/redux/users';
import ROLES from 'apps/app/shared/redux/users/roles';

const propTypes = {
  baseUrl: PropTypes.string,
  subpath: PropTypes.string,
  tabsVisibility: PropTypes.object,
};

const defaultProps = {
  baseUrl: '',
  subpath: '/preview',
  tabsVisibility: {},
};

class FormNav extends Component {
  constructor(props) {
    super(props);
    this.defaultTab = '/preview';
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
      <div className="form-generator-nav">
        <Nav tabs>
          <RenderIf condition={tv.edit}>
            <NavItem>
              <Link
                className={this.getClassName('/edit')}
                to={`${baseUrl}/edit`}
              >
                Генератор
              </Link>
            </NavItem>
          </RenderIf>
          <RenderIf condition={tv.preview}>
            <NavItem>
              <Link
                className={this.getClassName('/preview')}
                to={`${baseUrl}/preview`}
              >
                Предпросмотр
              </Link>
            </NavItem>
          </RenderIf>
          <RenderIf condition={tv.distribute}>
            <NavItem>
              <Link
                className={this.getClassName('/distribute')}
                to={`${baseUrl}/distribute`}
              >
                Сбор ответов
              </Link>
            </NavItem>
          </RenderIf>
          <RenderIf condition={tv.responses}>
            <NavItem>
              <Link
                className={this.getClassName('/responses')}
                to={`${baseUrl}/responses`}
              >
                Результаты
              </Link>
            </NavItem>
          </RenderIf>
        </Nav>
      </div>
    );
  }
}

FormNav.propTypes = propTypes;
FormNav.defaultProps = defaultProps;

function mapStateToProps(state, { id: formId }) {
  const { collecting, ownerId } = formQuery.getFormEntity(state, formId);
  const sessionUserId = sessionQuery.getUserId(state);
  const { role } = userQuery.getUserEntity(state, sessionUserId);

  const canEdit = !collecting;
  const isRootOrAdmin = role === ROLES.ROOT || role === ROLES.ADMIN;
  const isOwner = ownerId === sessionUserId;

  const tabsVisibility = {
    edit: isOwner && canEdit,
    preview: true,
    distribute: isRootOrAdmin || isOwner,
    responses: isRootOrAdmin || isOwner,
  };

  return { tabsVisibility };
}

export default connect(mapStateToProps)(FormNav);
