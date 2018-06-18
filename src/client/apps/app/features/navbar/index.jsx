import React, { Component } from 'react';
import { Navbar, Button } from 'reactstrap';
import { SessionAPI } from 'api/';
import { Link } from 'shared/router/components';
import NavbarNavigation from './components/NavbarNavigation';

const propTypes = {};

const defaultProps = {};

class AppNavbar extends Component {
  static async handleSignOut() {
    const confirm =
      window.confirm('Вы действительно хотите выйти из системы?');

    if (!confirm) {
      return;
    }

    try {
      const response = await SessionAPI.signOut();
    } catch (error) {
      console.error(error.message);
    }

    window.location.href = '/signin';
  }

  render() {
    return (
      <Navbar id="app-navbar" light expand>
        <div className="container">
          <Link to="/" className="navbar-brand">
            РАССИ
          </Link>
          <NavbarNavigation />
          <Button
            id="sign-out"
            size="sm"
            outline
            onClick={AppNavbar.handleSignOut}
          >
            Выйти
          </Button>
        </div>
      </Navbar>
    );
  }
}

AppNavbar.propTypes = propTypes;
AppNavbar.defaultProps = defaultProps;

export default AppNavbar;
