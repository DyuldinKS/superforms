import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormText } from 'reactstrap';
import FormItem from './FormItem';
import RequiredAsterisk from './RequiredAsterisk';

const propTypes = {
  form: PropTypes.object.isRequired,
  getRef: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  submitButton: PropTypes.node,
};

const defaultProps = {
  onSubmit: () => {},
  submitButton: null,
};

class Form extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(event);
  }

  render() {
    const { getRef, form, submitButton } = this.props;
    const { scheme, title, description } = form;
    const { items, order } = scheme;

    return (
      <form
        className="generated-form"
        ref={getRef}
        noValidate
        onSubmit={this.handleSubmit}
      >
        <header>
          <h1>{title}</h1>
          <FormText color="info">
            {description}
          </FormText>
          <FormText color="danger">
            <RequiredAsterisk /> Обязательное поле
          </FormText>
        </header>

        {
          order.map(itemId => (
            <FormItem
              key={itemId}
              id={itemId}
              {...items[itemId]}
            />
          ))
        }

        {submitButton}
      </form>
    );
  }
}

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;

export default Form;
