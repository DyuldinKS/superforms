import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  lead: PropTypes.string,
  breadcrumb: PropTypes.element,
  header: PropTypes.string,
};

const defaultProps = {
  lead: '',
  breadcrumb: null,
  header: '',
};

function ProfileHeader({ lead, breadcrumb, header }) {
  return (
    <div className="app-profile-header">
      {breadcrumb}
      <p className="lead">{lead}</p>
      <h1>{header}</h1>
    </div>
  );
}

ProfileHeader.propTypes = propTypes;
ProfileHeader.defaultProps = defaultProps;

export default ProfileHeader;
