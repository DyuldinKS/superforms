import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'shared/router/components';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import locales from 'apps/app/shared/utils/locales';

const propTypes = {
  id: PropTypes.string.isRequired,
  // from Redux
  name: PropTypes.string,
  chiefOrgName: PropTypes.string,
  status: PropTypes.string,
};

const defaultProps = {
  name: '',
  chiefOrgName: '',
  status: '',
};

function OrgsListItem(props) {
  const {
    id,
    name,
    chiefOrgName,
    status,
  } = props;

  return (
    <React.Fragment>
      <div className="orgs-list-item-cell-name">
        <Link
          to={`/orgs/${id}`}
        >
          {name}
        </Link>
      </div>
      <div className="orgs-list-item-cell-chief">
        {chiefOrgName}
      </div>
      <div className="orgs-list-item-cell-status">
        {status}
      </div>
    </React.Fragment>
  );
}

OrgsListItem.propTypes = propTypes;
OrgsListItem.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const orgId = ownProps.id;
  const org = orgsModule.selectors.getOrgEntity(state, orgId);
  const { chiefOrgId } = org;
  const { label: chiefOrgName } = orgsModule.selectors.getOrgEntity(state, chiefOrgId);

  return {
    name: org.label,
    status: locales.getStatus(org.status),
    chiefOrgName,
  };
}

export default connect(mapStateToProps, null)(OrgsListItem);
