import React from 'react';
import PropTypes from 'prop-types';
import { constants } from '../utils/itemTypes';
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
    case constants.INPUT:
      return <FormInput {...passProps} />;

    case constants.DELIMETER:
      return <FormDelimeter {...passProps} />;

    default:
      return null;
  }
}

FormItem.propTypes = propTypes;
FormItem.defaultProps = defaultProps;

export default FormItem;
