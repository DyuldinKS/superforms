import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Label,
  Form,
  FormGroup,
  Input,
} from 'reactstrap';

const propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  patronymic: PropTypes.string,
  onSubmit: PropTypes.func,
};

const defaultProps = {
  onSubmit: () => {},
};

class ChangeUserInfoForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: props.firstName,
      lastName: props.lastName,
      patronymic: props.patronymic,
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

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormGroup>
          <Label for="lastName">Фамилия</Label>
          <Input
            name="lastName"
            value={this.getValue('lastName')}
            onChange={this.handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label for="firstName">Имя</Label>
          <Input
            name="firstName"
            value={this.getValue('firstName')}
            onChange={this.handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label for="patronymic">Отчество</Label>
          <Input
            name="patronymic"
            value={this.getValue('patronymic')}
            onChange={this.handleInputChange}
          />
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

ChangeUserInfoForm.propTypes = propTypes;
ChangeUserInfoForm.defaultProps = defaultProps;

export default ChangeUserInfoForm;
