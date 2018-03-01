import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {};

const defaultProps = {};

class BaseComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      values: {},
      uploading: false,
      error: null,
    };

    this.requiredFields = [];

    this.handleInputChange = this.handleInputChange.bind(this);
    this.checkRequiredFields = this.checkRequiredFields.bind(this);
    this.trimValues = this.trimValues.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitRequest = this.handleSubmitRequest.bind(this);
    this.handleSubmitFailure = this.handleSubmitFailure.bind(this);
  }

  checkRequiredFields() {
    return this.requiredFields.find(name =>
      !this.getValue(name) || this.getValue(name).trim().length === 0);
  }

  trimValues() {
    const { values } = this.state;

    return Object.keys(values).reduce((acc, key) => ({
      ...acc,
      [key]: values[key].trim(),
    }), {});
  }

  handleInputChange(event) {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState(state => ({
      ...state,
      values: {
        ...state.values,
        [name]: value,
      },
    }));
  }

  handleSubmitRequest() {
    this.setState(state => ({
      ...state,
      uploading: true,
      error: null,
    }));
  }

  handleSubmitFailure(message) {
    this.setState(state => ({
      ...state,
      uploading: false,
      error: message,
    }));
  }

  async handleSubmit(event) {
    event.preventDefault();

    if (!this.onSubmit) {
      console.error('onSubmit method did not found');
      return;
    }

    this.handleSubmitRequest();

    const missingField = this.checkRequiredFields();

    if (missingField) {
      this.handleSubmitFailure(`Missing ${missingField}`);
    } else {
      const trimedValues = this.trimValues();

      const response = await this.onSubmit(trimedValues);

      if (response.error) {
        this.handleSubmitFailure(response.payload.message);
      }
    }
  }

  getValue(name) {
    return this.state.values[name] || '';
  }

  render() {
    return null;
  }
}

BaseComponent.propTypes = propTypes;
BaseComponent.defaultProps = defaultProps;

export default BaseComponent;
