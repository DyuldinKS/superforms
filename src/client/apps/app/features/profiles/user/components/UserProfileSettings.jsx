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
import * as usersModule from 'apps/app/shared/redux/users';
import { ChangeEmail } from '../../shared/components/forms';
import { ChangeRole, ChangeUserInfo } from './forms';

const propTypes = {
  // from Redux
  id: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  patronymic: PropTypes.string,
  role: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  email: PropTypes.string.isRequired,
  changeInfo: PropTypes.func,
  changeEmail: PropTypes.func,
  changeRole: PropTypes.func,
  changeStatus: PropTypes.func,
};

const defaultProps = {
  patronymic: '',
  changeInfo: () => {},
  changeEmail: () => {},
  changeRole: () => {},
  changeStatus: () => {},
};

class UserSettings extends Component {
  constructor(props) {
    super(props);

    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleRoleChange = this.handleRoleChange.bind(this);
    this.handleActiveChange = this.handleActiveChange.bind(this);
  }

  handleActiveChange() {
    const { active, changeStatus, id } = this.props;
    changeStatus(id, !active);
  }

  handleInfoChange(form) {
    const { id, changeInfo } = this.props;
    changeInfo(id, form);
  }

  handleEmailChange(form) {
    const { id, changeEmail } = this.props;
    changeEmail(id, form.email);
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
      role,
      email,
      firstName,
      lastName,
      patronymic,
    } = this.props;

    return (
      <div>
        <Nav vertical>
          <NavItem>
            <Button
              color="link"
              onClick={this.handleActiveChange}
            >
              {this.renderChangeActiveToggle()}
            </Button>
          </NavItem>

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

          <AccordionItem
            label="Изменить роль"
          >
            <ChangeRole
              role={role}
              onSubmit={this.handleRoleChange}
            />
          </AccordionItem>

          <AccordionItem
            label="Изменить адрес электронной почты"
          >
            <ChangeEmail
              email={email}
              onSubmit={this.handleEmailChange}
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
  const userId = ownProps.match.params.id;
  const user = usersModule.selectors.getUser(state, userId);
  const {
    active,
    role,
    email,
    firstName,
    lastName,
    patronymic,
  } = user.entity;

  return {
    id: userId,
    active,
    role,
    email,
    firstName,
    lastName,
    patronymic,
  };
}

const mapDispatchToProps = {
  changeStatus: usersModule.actions.changeStatus,
  changeRole: usersModule.actions.changeRole,
  changeEmail: usersModule.actions.changeEmail,
  changeInfo: usersModule.actions.changeInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings);
