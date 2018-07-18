import React from 'react';
import PropTypes from 'prop-types';
import { connectNewOrg } from '../shared/components/connect';
import Breadcrumb from '../shared/components/Breadcrumb';
import CreateOrgForm from './components/CreateOrgForm';

const propTypes = {
  // from Redux
  parentId: PropTypes.number.isRequired,
  parentOrgName: PropTypes.string.isRequired,
  createOrg: PropTypes.func.isRequired,
};

const defaultProps = {};

function CreateOrgRoute(props) {
  const {
    createOrg,
    parentId,
    parentOrgName,
  } = props;

  return (
    <React.Fragment>
      <Breadcrumb id={parentId} lastLabel="Новая организация" />
      <div className="container app-creation">
        <h1>Новая организация</h1>

        <CreateOrgForm
          onSubmit={createOrg}
          parentOrgName={parentOrgName}
        />
      </div>
    </React.Fragment>
  );
}

CreateOrgRoute.propTypes = propTypes;
CreateOrgRoute.defaultProps = defaultProps;

export default connectNewOrg(CreateOrgRoute);
