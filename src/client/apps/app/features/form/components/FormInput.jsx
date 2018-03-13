import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as formModule from 'apps/app/shared/redux/forms';
import { FormGroup, FormText, Label } from 'reactstrap';
import InputNumber from './inputs/InputNumber';

const propTypes = {
  formId: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

const defaultProps = {
  description: null,
};

function FormInput(props) {
  const { title, id, description } = props;

  return (
    <FormGroup>
      <Label>{title}</Label>
      <FormText color="info">{description}</FormText>
      <InputNumber name={id} />
    </FormGroup>
  );
}

FormInput.propTypes = propTypes;
FormInput.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { formId, id: itemId } = ownProps;

  return formModule.selectors.getItem(state, formId, itemId);
}

export default connect(mapStateToProps, null)(FormInput);
