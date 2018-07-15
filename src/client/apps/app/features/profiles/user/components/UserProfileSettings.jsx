/**
 * Displays settings for user profile
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Nav,
  NavItem,
  Button,
} from 'reactstrap';
import { AccordionItem } from 'shared/ui/accordion';
import {
  actions as userActions,
  selectors as userQuery,
} from 'apps/app/shared/redux/users';
import { selectors as sessionQuery } from 'apps/app/shared/redux/session';
import RenderIf from 'shared/helpers/RenderIf';
import { ChangeEmail } from '../../shared/components/forms';
import { ChangePassword, ChangeRole, ChangeUserInfo } from './forms';
import UserAPI from 'api/UserAPI';

const propTypes = {
  // from Redux
  id: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  changeEmail: PropTypes.func,
  changeInfo: PropTypes.func,
  changeRole: PropTypes.func,
  changeStatus: PropTypes.func,
  email: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  isSessionUser: PropTypes.bool,
  lastName: PropTypes.string.isRequired,
  patronymic: PropTypes.string,
  role: PropTypes.string.isRequired,
};

const defaultProps = {
  isSessionUser: true,
  patronymic: '',
  changeInfo: () => {},
  changeEmail: () => {},
  changeRole: () => {},
  changeStatus: () => {},
};

class UserSettings extends Component {
  constructor(props) {
    super(props);

    this.handleActiveChange = this.handleActiveChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleRoleChange = this.handleRoleChange.bind(this);
  }

  handleActiveChange() {
    const { active, changeStatus, id } = this.props;
    const action = active ? 'заблокировать' : 'разблокировать';

    const confirm = window.confirm(`Вы действительно хотите ${action} доступ в систему для данного пользователя?`);

    if (confirm) {
      changeStatus(id, !active);
    }
  }

  handleInfoChange(form) {
    const { id, changeInfo } = this.props;
    changeInfo(id, form);
  }

  handleEmailChange(form) {
    const { id, changeEmail } = this.props;
    changeEmail(id, form.email);
  }

  async handlePasswordChange(password) {
    const { id } = this.props;

    try {
      const response = await UserAPI.setPassword(id, password);
      alert('Пароль успешно изменен. Не забудьте сообщить пользователю его новый пароль!');
    } catch (error) {
      alert(`Произошла ошибка: ${error.message}`);
    }
  }

  handleRoleChange(form) {
    const { id, changeRole } = this.props;
    changeRole(id, form.role);
  }

  renderChangeActiveToggle() {
    const { active } = this.props;
    return active ?
      'Заблокировать доступ в систему' :
      'Открыть доступ в систему';
  }

  render() {
    const {
      email,
      firstName,
      isSessionUser,
      lastName,
      patronymic,
      role,
    } = this.props;

    return (
      <div>
        <Nav vertical>
          <RenderIf condition={!isSessionUser}>
            <NavItem>
              <Button
                color="link"
                onClick={this.handleActiveChange}
              >
                {this.renderChangeActiveToggle()}
              </Button>
            </NavItem>
          </RenderIf>

          <AccordionItem
            label="Изменить основную информацию"
          >
            <ChangeUserInfo
              firstName={firstName}
              lastName={lastName}
              patronymic={patronymic}
              onSubmit={this.handleInfoChange}
            />
          </AccordionItem>

          <RenderIf condition={!isSessionUser}>
            <AccordionItem
              label="Изменить роль"
            >
              <ChangeRole
                role={role}
                onSubmit={this.handleRoleChange}
              />
            </AccordionItem>
          </RenderIf>

          <AccordionItem
            label="Изменить адрес электронной почты"
          >
            <ChangeEmail
              email={email}
              onSubmit={this.handleEmailChange}
            />
          </AccordionItem>

          <AccordionItem
            label="Сменить пароль"
          >
            <ChangePassword
              onSubmit={this.handlePasswordChange}
            />
          </AccordionItem>
        </Nav>
      </div>
    );
  }
}

UserSettings.propTypes = propTypes;
UserSettings.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const userId = Number(ownProps.match.params.id);
  const sessionUserId = sessionQuery.getUserId(state);
  const isSessionUser = sessionUserId === userId;

  const {
    active,
    role,
    email,
    firstName,
    lastName,
    patronymic,
  } = userQuery.getUserEntity(state, userId);

  return {
    id: userId,
    active,
    role,
    email,
    firstName,
    lastName,
    patronymic,
    isSessionUser,
  };
}

const mapDispatchToProps = {
  changeStatus: userActions.changeStatus,
  changeRole: userActions.changeRole,
  changeEmail: userActions.changeEmail,
  changeInfo: userActions.changeInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings);
