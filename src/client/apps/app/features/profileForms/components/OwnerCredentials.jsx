import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as usersModule from 'apps/app/shared/redux/users';

const propTypes = {
  id: PropTypes.string.isRequired,
};

const defaultProps = {};

function FormOwnerCredentials(props) {
  return props.name;
}

FormOwnerCredentials.propTypes = propTypes;
FormOwnerCredentials.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { id } = ownProps;

  return {
    name: usersModule.selectors.getShortName(state, id),
  };
}

export default connect(mapStateToProps, null)(FormOwnerCredentials);
