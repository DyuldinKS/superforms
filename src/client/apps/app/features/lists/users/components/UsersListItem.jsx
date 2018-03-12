import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'shared/router/components';
import * as usersModule from 'apps/app/shared/redux/users';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import locales from 'apps/app/shared/utils/locales';

const propTypes = {
  id: PropTypes.string.isRequired,
  // from Redux
  fullName: PropTypes.string,
  orgName: PropTypes.string,
  role: PropTypes.string,
  status: PropTypes.string,
};

const defaultProps = {
  fullName: '',
  orgName: '',
  role: '',
  status: '',
};

function UsersListItem(props) {
  const {
    id,
    fullName,
    orgName,
    role,
    status,
  } = props;

  return (
    <React.Fragment>
      <div className="users-list-item-cell-fullname">
        <Link
          to={`/user/${id}`}
        >
          {fullName}
        </Link>
      </div>
      <div className="users-list-item-cell-org">
        {orgName}
      </div>
      <div className="users-list-item-cell-role">
        {role}
      </div>
      <div className="users-list-item-cell-status">
        {status}
      </div>
    </React.Fragment>
  );
}

UsersListItem.propTypes = propTypes;
UsersListItem.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const userId = ownProps.id;
  const user = usersModule.selectors.getUserEntity(state, userId);
  const { orgId } = user;
  const { label: orgName } = orgsModule.selectors.getOrgEntity(state, orgId);

  return {
    fullName: usersModule.selectors.getFullName(state, userId),
    role: locales.getRole(user.role),
    status: locales.getStatus(user.status),
    orgName,
  };
}

export default connect(mapStateToProps, null)(UsersListItem);
