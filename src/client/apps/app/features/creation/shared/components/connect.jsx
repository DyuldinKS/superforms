import { connect } from 'react-redux';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import * as usersModule from 'apps/app/shared/redux/users';
import { selectors as sessionQuery } from 'apps/app/shared/redux/session';

function mapStateToPropsForUser(state, ownProps) {
  const parentOrgId = Number(ownProps.match.params.orgId);
  const {
    label: parentOrgName,
  } = orgsModule.selectors.getOrgEntity(state, parentOrgId);

  const sessionUserId = sessionQuery.getUserId(state);
  const { role } = usersModule.selectors.getUserEntity(state, sessionUserId);

  return {
    parentId: parentOrgId,
    parentOrgName,
    sessionRole: role,
  };
}

function mapStateToPropsForOrg(state, ownProps) {
  const parentOrgId = Number(ownProps.match.params.orgId);
  const {
    label: parentOrgName,
  } = orgsModule.selectors.getOrgEntity(state, parentOrgId);

  return {
    parentId: parentOrgId,
    parentOrgName,
  };
}

function mapDispatchToPropsForUser(dispatch, ownProps) {
  const parentOrgId = Number(ownProps.match.params.orgId);

  return {
    createUser: payload =>
      dispatch(usersModule.actions.create(parentOrgId, payload)),
  };
}

function mapDispatchToPropsForOrg(dispatch, ownProps) {
  const parentOrgId = Number(ownProps.match.params.orgId);

  return {
    createOrg: payload =>
      dispatch(orgsModule.actions.create(parentOrgId, payload)),
  };
}

export const connectNewUser = connect(
  mapStateToPropsForUser,
  mapDispatchToPropsForUser,
);

export const connectNewOrg = connect(
  mapStateToPropsForOrg,
  mapDispatchToPropsForOrg,
);
