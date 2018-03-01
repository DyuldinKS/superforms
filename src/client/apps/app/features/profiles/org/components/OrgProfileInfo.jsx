/**
 * Displays detailed information about org
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody } from 'reactstrap';
import * as orgsModule from 'apps/app/shared/redux/orgs';

const propTypes = {
  email: PropTypes.string,
};

const defaultProps = {
  email: 'Не указан',
};

function OrgInfo(props) {
  return (
    <Card className="app-profile-info">
      <CardHeader>
        <h2>Контактная информация</h2>
      </CardHeader>
      <CardBody>
        <div>
          <div>
            Электронный адрес:
          </div>
          <div>
            {props.email}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

OrgInfo.propTypes = propTypes;
OrgInfo.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const orgId = ownProps.match.params.id;
  const org = orgsModule.selectors.getOrg(state, orgId);

  return {
    email: org.entity.email,
  };
}

export default connect(mapStateToProps, null)(OrgInfo);
