import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  FormGroup,
  Input,
} from 'reactstrap';
import locales from 'Locales/entities';

const propTypes = {
  role: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
};

const defaultProps = {
  onSubmit: () => {},
};

const options = Object.keys(locales.role).reverse() || [];

class ChangeRoleForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      role: options[0] || null,
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
    const currentRole = this.props.role;
    const availableOptions = options.filter(option => option !== currentRole);
    return availableOptions.map(option => (
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

export default ChangeRoleForm;
