import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  FormText,
  Input,
  Label,
} from 'reactstrap';
import generatePassword from '../../../../../../../../server/libs/passwordGenerator';

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

const defaultProps = {};

const defaultPassword = {
  password: '',
  passwordRepeat: '',
};

class ChangePassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...defaultPassword,
      validationError: this.validate(defaultPassword),
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePasswordGeneration = this.handlePasswordGeneration.bind(this);
  }

  handleSubmit() {
    const { onSubmit } = this.props;
    const { password, validationError } = this.state;

    if (validationError) {
      return;
    }

    onSubmit(password);
  }

  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState((state) => {
      const newState = {
        ...state,
        [name]: value,
      };

      return {
        ...newState,
        validationError: this.validate(newState),
      };
    });
  }

  handlePasswordGeneration() {
    const password = generatePassword();

    this.setState((state) => {
      const newState = {
        ...state,
        password,
        passwordRepeat: password,
      };

      return {
        ...newState,
        validationError: this.validate(newState),
      };
    });
  }

  validate(values) {
    const { password, passwordRepeat } = values;
    let error = null;

    if (!password || password.length === 0) {
      error = 'Empty password';
    } else if (password.length < 8) {
      error = 'Password length must be at least 8 chars';
    } else if (password.length > 32) {
      error = 'Password length must be lesser than 32 chars';
    } else if (password !== passwordRepeat) {
      error = 'Passwords doesnt match';
    }

    return error;
  }

  render() {
    const { password, validationError, passwordRepeat } = this.state;
    const invalid = !!validationError;

    return (
      <div>
        <FormGroup>
          <div className="row">
            <div className="col">
              <Label>Новый пароль</Label>
              <Input
                name="password"
                onChange={this.handleInputChange}
                type="text"
                value={password}
              />
            </div>
            <div className="col">
              <Label>Повторите пароль</Label>
              <Input
                name="passwordRepeat"
                onChange={this.handleInputChange}
                type="text"
                value={passwordRepeat}
              />
            </div>
            <div className="col d-flex align-items-end">
              <Button
                onClick={this.handlePasswordGeneration}
              >
                Подобрать надежный пароль
              </Button>
            </div>
          </div>
          <FormText color="danger">{validationError}</FormText>
        </FormGroup>

        <Button
          color="primary"
          disabled={invalid}
          onClick={this.handleSubmit}
          type="submit"
        >
          Применить
        </Button>
      </div>
    );
  }
}

ChangePassword.propTypes = propTypes;
ChangePassword.defaultProps = defaultProps;

export default ChangePassword;
