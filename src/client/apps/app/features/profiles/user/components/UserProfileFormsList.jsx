import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import FormsListContainer from 'apps/app/features/lists/forms/user';
import * as usersModule from 'apps/app/shared/redux/users';

const propTypes = {
  // from Redux
  fetchList: PropTypes.func.isRequired,
};

const defaultProps = {};

function UserProfileFormsList(props) {
  const { fetchList, match } = props;
  const userId = match.params.id;

  return (
    <FormsListContainer
      userId={userId}
      fetchList={fetchList}
    />
  );
}

UserProfileFormsList.propTypes = propTypes;
UserProfileFormsList.defaultProps = defaultProps;

function mapDispatchToProps(dispatch, ownProps) {
  const userId = ownProps.match.params.id;

  return {
    fetchList: (...params) =>
      dispatch(usersModule.actions.fetchForms(userId, ...params)),
  };
}

export default connect(null, mapDispatchToProps)(UserProfileFormsList);
