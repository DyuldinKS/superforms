import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormText } from 'reactstrap';
import createForm from './createForm';
import FormItem from './FormItem';
import RequiredAsterisk from './RequiredAsterisk';

const propTypes = {
  errors: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  getRef: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  valid: PropTypes.bool.isRequired,
  values: PropTypes.object.isRequired,
};

const defaultProps = {};

class Form extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    this.props.handleSubmit(event);
  }

  render() {
    const { getRef, form } = this.props;
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

        <Button type="submit" color="primary">Отправить</Button>
      </form>
    );
  }
}

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;

export default createForm(Form);
