import React, { Component } from 'react';
import PropTypes from 'prop-types';

function handleErrorUpdate(errors, name, value) {
  if (!value) {
    // Error gone
    const { [name]: removedName, ...withoutName } = errors;
    return withoutName;
  }

  return {
    ...errors,
    [name]: value,
  };
}

export default function createForm(WrappedComponent) {
  const childContextTypes = {
    getInputProps: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
  };

  class FormContainer extends Component {
    constructor(props) {
      super(props);

      this.state = {
        values: {},
        errors: {},
      };

      this.getInputProps = this.getInputProps.bind(this);
      this.handleChange = this.handleChange.bind(this);
    }

    getChildContext() {
      return {
        getInputProps: this.getInputProps,
        handleChange: this.handleChange,
      };
    }

    getInputProps(name) {
      return {
        value: this.state.values[name] || '',
        error: this.state.errors[name] || '',
      };
    }

    handleChange(name, value, error) {
      this.setState(state => ({
        values: {
          ...state.values,
          [name]: value,
        },
        errors: handleErrorUpdate(state.errors, name, error),
      }));
    }

    isValid() {
      const { errors } = this.state;
      return Object.keys(errors).length === 0;
    }

    render() {
      const {
        errors,
        values,
      } = this.state;

      const passProps = {
        errors,
        values,
        valid: this.isValid(),
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
