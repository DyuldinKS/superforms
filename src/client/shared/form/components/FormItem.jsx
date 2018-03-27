import React from 'react';
import PropTypes from 'prop-types';
import { formItems } from '../utils/constants';
import FormInput from './FormInput';
import FormDelimeter from './FormDelimeter';

const propTypes = {
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

export default FormItem;
