import { connect } from 'react-redux';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import * as usersModule from 'apps/app/shared/redux/users';

function mapStateToProps(state, ownProps) {
  const parentOrgId = ownProps.match.params.orgId;
  const {
    label: parentOrgName,
  } = orgsModule.selectors.getOrgEntity(state, parentOrgId);

  return {
    parentOrgName,
  };
}

function mapDispatchToPropsForUser(dispatch, ownProps) {
  const parentOrgId = ownProps.match.params.orgId;

  return {
    createUser: payload =>
      dispatch(usersModule.actions.create(parentOrgId, payload)),
  };
}

function mapDispatchToPropsForOrg(dispatch, ownProps) {
  const parentOrgId = ownProps.match.params.orgId;

  return {
    createOrg: payload =>
      dispatch(orgsModule.actions.create(parentOrgId, payload)),
  };
}

export const connectNewUser = connect(
  mapStateToProps,
  mapDispatchToPropsForUser,
);

export const connectNewOrg = connect(
  mapStateToProps,
  mapDispatchToPropsForOrg,
);
