import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  FormGroup,
  Input,
} from 'reactstrap';

const propTypes = {
  email: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
};

const defaultProps = {
  onSubmit: () => {},
};

class ChangeEmailForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: props.email,
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
          <Input
            name="email"
            value={this.getValue('email')}
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

ChangeEmailForm.propTypes = propTypes;
ChangeEmailForm.defaultProps = defaultProps;

export default ChangeEmailForm;
