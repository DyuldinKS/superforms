/**
 * Displays detailed information about user
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody } from 'reactstrap';
import * as usersModule from 'apps/app/shared/redux/users';


const propTypes = {
  email: PropTypes.string,
};

const defaultProps = {
  email: 'Не указан',
};

function UserInfo(props) {
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

UserInfo.propTypes = propTypes;
UserInfo.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const userId = ownProps.match.params.id;
  const user = usersModule.selectors.getUser(state, userId);

  return {
    email: user.entity.email,
  };
}

export default connect(mapStateToProps, null)(UserInfo);
