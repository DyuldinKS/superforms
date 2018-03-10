import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { Link } from 'shared/router/components';
import * as usersModule from 'apps/app/shared/redux/users';
import { SessionAPI } from 'api/';

const propTypes = {
  userId: PropTypes.string.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
};

const defaultProps = {
  firstName: 'Не указано',
  lastName: 'Не указано',
};

async function handleSignOut() {
  try {
    const response = await SessionAPI.signOut();
  } catch (error) {
    console.error(error.message);
  }

  window.location.href = '/signin';
}

function HeaderAccount(props) {
  const {
    userId,
    firstName,
    lastName,
  } = props;

  return (
    <div className="app-header-account">
      <Link
        to={`/users/${userId}`}
        className="app-header-account-username"
      >
        {`${firstName} ${lastName}`}
      </Link>

      <Button color="link" onClick={handleSignOut}>Выйти</Button>
    </div>
  );
}

HeaderAccount.propTypes = propTypes;
HeaderAccount.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const {
    firstName,
    lastName,
  } = usersModule.selectors.getUserEntity(state, ownProps.userId);

  return {
    firstName,
    lastName,
  };
}

export default connect(mapStateToProps, null)(HeaderAccount);
