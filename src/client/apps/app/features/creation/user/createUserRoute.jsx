import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumb from '../shared/components/Breadcrumb';
import { connectNewUser } from '../shared/components/connect';
import CreateUserForm from './components/CreateUserForm';

const propTypes = {
  // from Redux
  parentId: PropTypes.number.isRequired,
  parentOrgName: PropTypes.string.isRequired,
  createUser: PropTypes.func.isRequired,
};

const defaultProps = {};

function CreateUserRoute(props) {
  const {
    createUser,
    parentId,
    parentOrgName,
  } = props;

  return (
    <React.Fragment>
      <Breadcrumb id={parentId} lastLabel="Новый пользователь" />
      <div className="container app-creation">
        <h1>Новый пользователь</h1>

        <CreateUserForm
          parentOrgName={parentOrgName}
          onSubmit={createUser}
        />
      </div>
    </React.Fragment>
  );
}

CreateUserRoute.propTypes = propTypes;
CreateUserRoute.defaultProps = defaultProps;

export default connectNewUser(CreateUserRoute);
