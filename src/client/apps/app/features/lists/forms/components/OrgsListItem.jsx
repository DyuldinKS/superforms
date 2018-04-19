import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'shared/router/components';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import { getActive } from 'apps/app/shared/utils/locales';

const propTypes = {
  id: PropTypes.string.isRequired,
  // from Redux
  name: PropTypes.string,
  parentOrgName: PropTypes.string,
  active: PropTypes.bool,
};

const defaultProps = {
  name: '',
  parentOrgName: '',
  active: '',
};

function OrgsListItem(props) {
  const {
    id,
    name,
    parentOrgName,
    active,
  } = props;

  return (
    <React.Fragment>
      <div className="orgs-list-item-cell-name">
        <Link
          to={`/org/${id}`}
        >
          {name}
        </Link>
      </div>
      <div className="orgs-list-item-cell-chief">
        {parentOrgName}
      </div>
      <div className="orgs-list-item-cell-active">
        {active}
      </div>
    </React.Fragment>
  );
}

OrgsListItem.propTypes = propTypes;
OrgsListItem.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const orgId = ownProps.id;
  const org = orgsModule.selectors.getOrgEntity(state, orgId);
  const { parentId } = org;
  const { label: parentOrgName } = orgsModule.selectors.getOrgEntity(state, parentId);

  return {
    name: org.label,
    active: getActive(org.active),
    parentOrgName,
  };
}

export default connect(mapStateToProps, null)(OrgsListItem);
