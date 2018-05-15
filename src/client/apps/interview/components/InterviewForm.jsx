import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'reactstrap';
import createForm from 'shared/form/components/createForm';
import Form from 'shared/form/components/Form';

const propTypes = {
  form: PropTypes.object.isRequired,
  submitValues: PropTypes.func,
  // from createForm HOC
  getRef: PropTypes.func.isRequired,
  invalid: PropTypes.bool.isRequired,
  showErrors: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
};

const defaultProps = {
  submitValues: async () => {},
};

const defaultState = {
  submitting: false,
  submitError: null,
  submited: false,
};

class InterviewForm extends Component {
  constructor(props) {
    super(props);

    this.state = defaultState;

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmitRequest() {
    return this.setState(() => ({
      ...defaultState,
      submitting: true,
    }));
  }

  handleSubmitSuccess() {
    return this.setState(() => ({
      ...defaultState,
      submited: true,
    }));
  }

  handleSubmitFailure(message) {
    return this.setState(() => ({
      ...defaultState,
      submitError: message,
    }));
  }

  async handleSubmit(event) {
    const { invalid, values } = this.props;
    event.preventDefault();

    if (this.state.submitting) {
      return;
    }

    if (invalid) {
      this.props.showErrors();
      return;
    }

    this.handleSubmitRequest();
    const result = await this.props.submitValues(values);
    if (result && result.error) {
      const { message } = result.payload;
      this.handleSubmitFailure(message);
    } else {
      this.handleSubmitSuccess();
    }
  }

  renderSubmitButton() {
    const { submitError, submitting } = this.state;

    return (
      <React.Fragment>
        {
          submitError &&
          <Alert color="danger">
            <h4 className="alert-heading">Не удалось отправить ответ</h4>
            {submitError}
          </Alert>
        }

        <Button type="submit" color="primary" disabled={submitting}>
          {
            submitting
            ? 'Отправка...'
            : 'Отправить'
          }
        </Button>
      </React.Fragment>
    );
  }

  render() {
    const { getRef, form } = this.props;
    const { title } = form;

    if (this.state.submited) {
      return (
        <div className="generated-form">
          <header>
            <h1>{title}</h1>
          </header>
          <Alert color="success">
            <h4 className="alert-heading mb-0">Ваш ответ записан</h4>
          </Alert>
        </div>
      );
    }

    return (
      <Form
        getRef={getRef}
        form={form}
        onSubmit={this.handleSubmit}
        submitButton={this.renderSubmitButton()}
      />
    );
  }
}

InterviewForm.propTypes = propTypes;
InterviewForm.defaultProps = defaultProps;

export default createForm(InterviewForm);
