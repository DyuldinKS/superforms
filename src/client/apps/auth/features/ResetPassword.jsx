import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

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

  handleSubmit(event) {
    event.preventDefault();

    this.props.onRequest();

    window.setTimeout(
      () => this.props.onAlert(
        'danger',
        'На данный момент эта функция не работает',
      ),
      500,
    );
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
