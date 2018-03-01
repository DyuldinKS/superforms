/**
 * User profile header
 * Contains basic information, that useful on every tab view
 */

import React from 'react';
import PropTypes from 'prop-types';
import locales from 'apps/app/shared/utils/locales';

function getFullName(user) {
  const {
    firstName = '',
    lastName = '',
    patronymic = '',
  } = user;

  return `${lastName} ${firstName} ${patronymic}`;
}

const propTypes = {
  user: PropTypes.object.isRequired,
  org: PropTypes.object.isRequired,
};

const defaultProps = {};

function ProfileHeader(props) {
  const { org, user } = props;

  return (
    <div className="app-profile-header">
      <h1>{getFullName(user)}</h1>
      <p>{org.label}</p>
      <dl>
        <dt>Статус:</dt>
        <dd>{locales.getStatus(user.status)}</dd>

        <dt>Роль:</dt>
        <dd>{locales.getRole(user.role)}</dd>
      </dl>
    </div>
  );
}

ProfileHeader.propTypes = propTypes;
ProfileHeader.defaultProps = defaultProps;

export default ProfileHeader;
