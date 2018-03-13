import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as formModule from 'apps/app/shared/redux/forms';
import { formItems } from '../utils/constants';
import FormInput from './FormInput';
import FormDelimeter from './FormDelimeter';

const propTypes = {
  formId: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  itemType: PropTypes.string.isRequired,
};

const defaultProps = {};

function FormItem(props) {
  const { itemType, ...passProps } = props;

  switch (itemType) {
    case formItems.INPUT:
      return <FormInput {...passProps} />;

    case formItems.DELIMETER:
      return <FormDelimeter {...passProps} />;

    default:
      return null;
  }
}

FormItem.propTypes = propTypes;
FormItem.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { formId, id: itemId } = ownProps;

  return {
    itemType: formModule.selectors.getItem(state, formId, itemId)['_type'],
  };
}

export default connect(mapStateToProps, null)(FormItem);
