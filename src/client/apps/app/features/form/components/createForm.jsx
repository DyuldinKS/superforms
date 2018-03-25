import React, { Component } from 'react';
import PropTypes from 'prop-types';
import deleteMapProp from '../utils/deleteMapProp';

/*
  value = null - remove error
  value = undefined - preserve current error
*/
function updateErrors(errors, name, value) {
  if (value === undefined) return errors;

  if (!value) return deleteMapProp(errors, name);

  return {
    ...errors,
    [name]: value,
  };
}

export default function createForm(WrappedComponent) {
  const childContextTypes = {
    getInputProps: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    setValue: PropTypes.func.isRequired,
  };

  class FormContainer extends Component {
    constructor(props) {
      super(props);

      this.state = {
        values: {},
        errors: null,
      };

      this.getInputProps = this.getInputProps.bind(this);
      this.setError = this.setError.bind(this);
      this.setValue = this.setValue.bind(this);
    }

    getChildContext() {
      return {
        getInputProps: this.getInputProps,
        setError: this.setError,
        setValue: this.setValue,
      };
    }

    getInputProps(name) {
      const { errors, values } = this.state;
      const error = errors && errors[name];

      return {
        value: values[name] || '',
        error: error || '',
        valid: !error,
        invalid: !!error,
      };
    }

    setError(name, error) {
      this.setState(state => ({
        values: state.values,
        errors: updateErrors(state.errors, name, error),
      }));
    }

    setValue(name, value, error) {
      this.setState(state => ({
        values: {
          ...state.values,
          [name]: value,
        },
        errors: updateErrors(state.errors, name, error),
      }));
    }

    render() {
      const {
        errors,
        values,
      } = this.state;

      const passProps = {
        errors,
        values,
        valid: !errors,
        invalid: !!errors,
      };

      return (
        <WrappedComponent
          {...this.props}
          {...passProps}
        />
      );
    }
  }

  const wrappedComponentName = WrappedComponent.displayName
    || WrappedComponent.name
    || 'Component';

  FormContainer.displayName = `withFormState(${wrappedComponentName})`;
  FormContainer.childContextTypes = childContextTypes;

  return FormContainer;
}
