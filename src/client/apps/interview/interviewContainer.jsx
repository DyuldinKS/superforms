import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ResponseAPI } from 'api/';
import InterviewForm from './components/InterviewForm';
import getPropsFromURL from './utils/getPropsFromURL';

const propTypes = {
  form: PropTypes.object.isRequired,
};

const defaultProps = {};

class InterviewContainer extends Component {
  constructor(props) {
    super(props);

    this.urlProps = {
      formId: null,
      secret: null,
    };

    this.submitValues = this.submitValues.bind(this);
  }

  componentDidMount() {
    this.urlProps = getPropsFromURL();
  }

  async submitValues(values) {
    const { formId, secret } = this.urlProps;

    try {
      const res = await ResponseAPI.create(formId, secret, values);
      return res;
    } catch (error) {
      throw (error);
    }
  }

  render() {
    return (
      <InterviewForm
        {...this.props}
        submitValues={this.submitValues}
      />
    );
  }
}

InterviewContainer.propTypes = propTypes;
InterviewContainer.defaultProps = defaultProps;

export default InterviewContainer;
