import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import { SessionAPI } from 'api/';

const propTypes = {
  loading: PropTypes.bool,
  onFailure: PropTypes.func,
  onRequest: PropTypes.func,
};

const defaultProps = {
  loading: false,
  onRequest: () => {},
  onFailure: () => {},
};

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const email = data.get('email');
    const password = data.get('password');

    try {
      this.props.onRequest();
      const response = await SessionAPI.signIn(email, password);
      window.location.href = '/';
    } catch (error) {
      this.props.onFailure(error.message);
    }
  }

  render() {
    const { loading } = this.props;

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormGroup>
          <Label for="email">Email</Label>
          <Input
            name="email"
            placeholder="Введите email"
          />
        </FormGroup>
        <FormGroup>
          <Label for="password">Пароль</Label>
          <Input
            name="password"
            type="password"
            placeholder="Введите пароль"
          />
        </FormGroup>
        <FormGroup>
          <Button
            type="submit"
            color="primary"
            disabled={loading}
          >
            Войти
          </Button>
        </FormGroup>
      </Form>
    );
  }
}

SignIn.propTypes = propTypes;
SignIn.defaultProps = defaultProps;

export default SignIn;
