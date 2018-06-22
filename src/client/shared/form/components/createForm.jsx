import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getCoords } from 'shared/utils';
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
  const propTypes = {};

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
        submitting: false,
        submitted: false,
        submitError: null,
      };

      this.getInputProps = this.getInputProps.bind(this);
      this.focusOnFirstError = this.focusOnFirstError.bind(this);

      this.setError = this.setError.bind(this);
      this.setValue = this.setValue.bind(this);

      this.getRef = this.getRef.bind(this);
      this.init = this.init.bind(this);
      this.showErrors = this.showErrors.bind(this);
      this.handleSubmitRequest = this.handleSubmitRequest.bind(this);
      this.handleSubmitSuccess = this.handleSubmitSuccess.bind(this);
      this.handleSubmitFailure = this.handleSubmitFailure.bind(this);
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

    init(values) {
      this.setState(() => ({
        errors: null,
        submitErrors: null,
        values,
      }));
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

    showErrors() {
      const { errors } = this.state;

      if (errors) {
        this.setState(state => ({
          ...state,
          submitErrors: { ...errors },
        }), this.focusOnFirstError);
      }
    }

    focusOnFirstError() {
      const { errors } = this.state;
      const formElements = this.formRef.elements;

      let i = 0;
      let found;
      while (i < formElements.length && !found) {
        const elName = formElements[i].name;
        found = errors[elName] ? formElements[i] : undefined;
        i++;
      }

      if (!found) {
        return;
      }


      const formGroup = found.closest('.form-group') || found;
      const { top } = getCoords(formGroup);
      window.scrollTo(window.pageXOffset, top - 50);
      found.focus();
    }

    handleSubmitRequest() {
      return this.setState({
        submitting: true,
        submitted: false,
        submitError: null,
      });
    }

    handleSubmitSuccess() {
      return this.setState({ submitting: false, submitted: true });
    }

    handleSubmitFailure(submitError) {
      return this.setState({ submitting: false, submitError });
    }

    render() {
      const {
        errors,
        submitting,
        submitted,
        submitError,
        values,
      } = this.state;

      const passProps = {
        errors,
        getRef: this.getRef,
        handleSubmitRequest: this.handleSubmitRequest,
        handleSubmitSuccess: this.handleSubmitSuccess,
        handleSubmitFailure: this.handleSubmitFailure,
        init: this.init,
        invalid: !!errors,
        showErrors: this.showErrors,
        submitting,
        submitted,
        submitError,
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
  FormContainer.propTypes = propTypes;
  FormContainer.childContextTypes = childContextTypes;

  return FormContainer;
}
