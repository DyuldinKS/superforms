import { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  onSubmit: PropTypes.func,
  parentOrgName: PropTypes.string.isRequired,
  // from createForm HOC
  errors: PropTypes.object,
  handleSubmitRequest: PropTypes.func.isRequired,
  handleSubmitSuccess: PropTypes.func.isRequired,
  handleSubmitFailure: PropTypes.func.isRequired,
  getRef: PropTypes.func.isRequired,
  init: PropTypes.func.isRequired,
  showErrors: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  submitError: PropTypes.string,
  values: PropTypes.object.isRequired,
};

const defaultProps = {
  errors: null,
  onSubmit: () => {},
  submitting: false,
  submitError: null,
};

class BaseCreateForm extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);

    props.init({ org: props.parentOrgName });
  }

  async handleSubmit(event) {
    event.preventDefault();

    if (this.props.submitting) {
      return;
    }

    if (this.props.errors) {
      this.props.showErrors();
      return;
    }

    this.props.handleSubmitRequest();

    try {
      const values = this.formatValues();

      const response = await this.props.onSubmit(values);

      if (response.error) {
        throw new Error(response.payload);
      } else {
        this.props.handleSubmitSuccess();
      }
    } catch (error) {
      console.log(error);
      this.props.handleSubmitFailure(error.message);
    }
  }

  formatValues() {
    return this.props.values;
  }

  render() {
    return null;
  }
}

BaseCreateForm.propTypes = propTypes;
BaseCreateForm.defaultProps = defaultProps;

export default BaseCreateForm;
