import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardBody,
  UncontrolledAlert as Alert,
} from 'reactstrap';
import ResetPassword from './features/ResetPassword';
import SignIn from './features/SignIn';

const SIGN_IN_PATH = '/signin';
const RECOVER_PATH = '/recovery';

const SIGN_IN_TITLE = 'Вход - SuperForms';
const RECOVER_TITLE = 'Восстановление доступа - SuperForms';

const propTypes = {
  location: PropTypes.string,
};

const defaultProps = {
  location: SIGN_IN_PATH,
};

class AuthContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      loading: false,
      location: this.props.location,
    };

    this.onRedirect = this.onRedirect.bind(this);
    this.handleRedirect = this.handleRedirect.bind(this);
    this.handlePopState = () => this.onRedirect(window.location.pathname);
    this.goToRestorePassword = () => this.handleRedirect(RECOVER_PATH);
    this.goToSignIn = () => this.handleRedirect(SIGN_IN_PATH);

    this.handleLoading = this.handleLoading.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handlePopState);
    this.handlePopState();
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
  }

  onRedirect(path) {
    this.setState(state => ({
      ...state,
      location: path,
      error: null,
    }));
  }

  handleRedirect(path) {
    window.history.pushState({}, '', path);
    this.onRedirect(path);
  }

  handleLoading() {
    console.log('request');

    this.setState(state => ({
      ...state,
      loading: true,
      error: null,
    }));
  }

  handleError(error) {
    this.setState(state => ({
      ...state,
      loading: false,
      error,
    }));
  }

  isRecoverView() {
    return this.state.location === RECOVER_PATH;
  }

  render() {
    const { error, loading } = this.state;
    const View = this.isRecoverView()
      ? ResetPassword
      : SignIn;

    return (
      <div className="auth-wrapper">
        <h1>
          {
            this.isRecoverView()
              ? 'Восстановить доступ'
              : 'Войти в систему'
          }
        </h1>

        {
          error
            ? <Alert color="danger">{error}</Alert>
            : null
        }

        <Card>
          <CardBody>
            <View
              loading={loading}
              onRequest={this.handleLoading}
              onFailure={this.handleError}
            />

            <Button
              color="link"
              disabled={loading}
              onClick={
                this.isRecoverView()
                  ? this.goToSignIn
                  : this.goToRestorePassword
              }
            >
              {
                this.isRecoverView()
                ? 'Вспомнили пароль?'
                : 'Забыли пароль?'
              }
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }
}

AuthContainer.propTypes = propTypes;
AuthContainer.defaultProps = defaultProps;

export default AuthContainer;
