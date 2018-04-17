import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import FormsListContainer from 'apps/app/features/lists/forms/org';
import * as orgsModule from 'apps/app/shared/redux/orgs';

const propTypes = {
  // from Redux
  fetchList: PropTypes.func.isRequired,
};

const defaultProps = {};

function OrgProfileFormsList(props) {
  const { fetchList, match } = props;
  const orgId = match.params.id;

  return (
    <FormsListContainer
      orgId={orgId}
      fetchList={fetchList}
    />
  );
}

OrgProfileFormsList.propTypes = propTypes;
OrgProfileFormsList.defaultProps = defaultProps;

function mapDispatchToProps(dispatch, ownProps) {
  const orgId = ownProps.match.params.id;

  return {
    fetchList: (...params) =>
      dispatch(orgsModule.actions.fetchForms(orgId, ...params)),
  };
}

export default connect(null, mapDispatchToProps)(OrgProfileFormsList);
