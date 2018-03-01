import { connect } from 'react-redux';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import * as usersModule from 'apps/app/shared/redux/users';

function mapStateToProps(state, ownProps) {
  const chiefOrgId = ownProps.match.params.orgId;
  const {
    label: chiefOrgName,
  } = orgsModule.selectors.getOrgEntity(state, chiefOrgId);

  return {
    chiefOrgName,
  };
}

function mapDispatchToPropsForUser(dispatch, ownProps) {
  const chiefOrgId = ownProps.match.params.orgId;

  return {
    createUser: payload =>
      dispatch(usersModule.actions.create(chiefOrgId, payload)),
  };
}

function mapDispatchToPropsForOrg(dispatch, ownProps) {
  const chiefOrgId = ownProps.match.params.orgId;

  return {
    createOrg: payload =>
      dispatch(orgsModule.actions.create(chiefOrgId, payload)),
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
