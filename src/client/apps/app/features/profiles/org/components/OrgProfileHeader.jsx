import React from 'react';
import PropTypes from 'prop-types';
import { getActive } from 'apps/app/shared/utils/locales';

const propTypes = {
  org: PropTypes.object.isRequired,
  parentOrg: PropTypes.object.isRequired,
};

const defaultProps = {};

function ProfileHeader(props) {
  const { org, parentOrg } = props;

  return (
    <div className="app-profile-header">
      <h1>{org.label}</h1>
      <p>{parentOrg.label}</p>
      <dl>
        <dt>Статус:</dt>
        <dd>{getActive(org.active)}</dd>
      </dl>
    </div>
  );
}

ProfileHeader.propTypes = propTypes;
ProfileHeader.defaultProps = defaultProps;

export default ProfileHeader;
