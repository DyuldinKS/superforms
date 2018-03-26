import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getCoords } from 'shared/utils';
import deleteMapProp from '../utils/deleteMapProp';
import { inputTypes } from '../utils/constants';

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
        errors: null,
        submitErrors: null,
        values: {},
      };

      this.getInputProps = this.getInputProps.bind(this);
      this.getRef = this.getRef.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.setError = this.setError.bind(this);
      this.setValue = this.setValue.bind(this);
      this.focusOnFirstError = this.focusOnFirstError.bind(this);
    }

    getChildContext() {
      return {
        getInputProps: this.getInputProps,
        setError: this.setError,
        setValue: this.setValue,
      };
    }

    getInputProps(name) {
      const { errors, submitErrors, values } = this.state;
      const error = errors && errors[name];
      const submitError = submitErrors && submitErrors[name];

      return {
        error: error || '',
        submitError: !!submitError,
        invalid: !!error,
        valid: !error,
        value: values[name] || '',
      };
    }

    getRef(form) {
      this.formRef = form;
    }

    handleSubmit(event) {
      event.preventDefault();
      const { errors, values } = this.state;

      if (errors) {
        this.setState(state => ({
          ...state,
          submitErrors: { ...errors },
        }), this.focusOnFirstError);
        return;
      }

      alert(JSON.stringify(values));
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
        submitErrors: deleteMapProp(state.submitErrors, name),
      }));
    }

    focusOnFirstError() {
      const { items, order } = this.props;
      const { errors } = this.state;
      const name = order.find(itemId => errors[itemId]);
      if (!name) return;
      const input = this.formRef.elements[name];
      const formGroup = input.closest('.form-group') || input;
      const { top } = getCoords(formGroup);
      window.scrollTo(window.pageXOffset, top - 50);
      input.focus();
    }

    render() {
      const {
        errors,
        values,
      } = this.state;

      const passProps = {
        errors,
        getRef: this.getRef,
        handleSubmit: this.handleSubmit,
        invalid: !!errors,
        valid: !errors,
        values,
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
