import React from 'react';
import PropTypes from 'prop-types';
import ProfileHeader from '../../shared/components/ProfileHeader';

const propTypes = {
  header: PropTypes.string,
  breadcrumb: PropTypes.element,
};

const defaultProps = {
  header: '',
  breadcrumb: null,
};

function OrgProfileHeader({ header, breadcrumb }) {
  return (
    <ProfileHeader
      lead="Профиль организации"
      breadcrumb={breadcrumb}
      header={header}
    />
  );
}

OrgProfileHeader.propTypes = propTypes;
OrgProfileHeader.defaultProps = defaultProps;

export default OrgProfileHeader;
