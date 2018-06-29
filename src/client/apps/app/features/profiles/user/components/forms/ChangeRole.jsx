import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  FormGroup,
  Input,
} from 'reactstrap';
import locales from 'Locales/entities';
import ROLES from 'apps/app/shared/redux/users/roles';
import { selectors as sessionQuery } from 'apps/app/shared/redux/session';
import { selectors as userQuery } from 'apps/app/shared/redux/users';

const propTypes = {
  role: PropTypes.string.isRequired,
  sessionRole: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
};

const defaultProps = {
  onSubmit: () => {},
};

class ChangeRoleForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      role: props.role || null,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState(state => ({
      ...state,
      [name]: value,
    }));
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state);
  }

  getValue(name) {
    return this.state[name] || '';
  }

  renderOptions() {
    const { sessionRole } = this.props;
    let options = Object.values(ROLES);

    if (sessionRole !== ROLES.ROOT) {
      options = options.filter(o => o !== ROLES.ROOT);
    }

    return options.map(option => (
      <option value={option} key={option}>{locales.role[option]}</option>
    ));
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormGroup>
          <Input
            name="role"
            type="select"
            value={this.getValue('role')}
            placeholder="Выберите роль"
            onChange={this.handleInputChange}
          >
            {this.renderOptions()}
          </Input>
        </FormGroup>

        <FormGroup>
          <Button type="submit" color="primary">
            Применить
          </Button>
        </FormGroup>
      </Form>
    );
  }
}

ChangeRoleForm.propTypes = propTypes;
ChangeRoleForm.defaultProps = defaultProps;

function mapStateToProps(state, props) {
  const sessionUserId = sessionQuery.getUserId(state);
  const { role } = userQuery.getUserEntity(state, sessionUserId);

  return {
    sessionRole: role,
  };
}

export default connect(mapStateToProps)(ChangeRoleForm);
