import React from 'react';
import PropTypes from 'prop-types';
import ProfileHeader from '../../shared/components/ProfileHeader';

const propTypes = {
  header: PropTypes.string,
};

const defaultProps = {
  header: '',
};

function UserProfileHeader({ header }) {
  return (
    <ProfileHeader
      lead="Профиль пользователя"
      header={header}
    />
  );
}

UserProfileHeader.propTypes = propTypes;
UserProfileHeader.defaultProps = defaultProps;

export default UserProfileHeader;
