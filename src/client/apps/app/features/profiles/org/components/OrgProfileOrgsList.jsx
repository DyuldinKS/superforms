import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import OrgsListContainer from 'apps/app/features/lists/orgs/orgsListContainer';
import * as orgsModule from 'apps/app/shared/redux/orgs';

const propTypes = {
  // from Redux
  fetchList: PropTypes.func.isRequired,
};

const defaultProps = {};

function OrgProfileUsersList(props) {
  const { fetchList, match } = props;
  const orgId = match.params.id;

  return (
    <OrgsListContainer
      orgId={orgId}
      fetchList={fetchList}
    />
  );
}

OrgProfileUsersList.propTypes = propTypes;
OrgProfileUsersList.defaultProps = defaultProps;

function mapDispatchToProps(dispatch, ownProps) {
  const orgId = ownProps.match.params.id;

  return {
    fetchList: (...params) =>
      dispatch(orgsModule.actions.fetchAffiliatedOrgs(orgId, ...params)),
  };
}

export default connect(null, mapDispatchToProps)(OrgProfileUsersList);
