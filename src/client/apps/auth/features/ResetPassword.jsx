import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import { UserAPI } from 'api/';

const propTypes = {
  loading: PropTypes.bool,
  onAlert: PropTypes.func,
  onRequest: PropTypes.func,
};

const defaultProps = {
  loading: false,
  onAlert: () => {},
  onRequest: () => {},
};

class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const email = data.get('email');

    try {
      this.props.onRequest();
      const response = await UserAPI.orderPasswordRecovery(email);
      this.props.onAlert(
        'success',
        `Письмо для восстановления пароля отправлено на вашу почту: ${email}`,
      );
    } catch (error) {
      this.props.onAlert('danger', error.message);
    }
  }

  render() {
    const { loading } = this.props;

    return (
      <Form onSubmit={this.handleSubmit} >
        <FormGroup>
          <Label for="email">Введите адрес электронной почты аккаунта и мы отправим вам ссылку на получение нового пароля.</Label>
          <Input
            name="email"
            placeholder="Введите email"
          />
        </FormGroup>
        <FormGroup>
          <Button
            type="submit"
            color="primary"
            disabled={loading}
          >
            Отправить письмо для сброса пароля
          </Button>
        </FormGroup>
      </Form>
    );
  }
}

ResetPassword.propTypes = propTypes;
ResetPassword.defaultProps = defaultProps;

export default ResetPassword;
