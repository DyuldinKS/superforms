import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as formModule from 'apps/app/shared/redux/forms';
import { FormGroup } from 'reactstrap';

const propTypes = {
  formId: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

const defaultProps = {};

function FormDelimeter(props) {
  const { title } = props;

  return (
    <FormGroup>
      <h6>{title}</h6>
      <hr />
    </FormGroup>
  );
}

FormDelimeter.propTypes = propTypes;
FormDelimeter.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { formId, id: itemId } = ownProps;

  return formModule.selectors.getItem(state, formId, itemId);
}

export default connect(mapStateToProps, null)(FormDelimeter);
