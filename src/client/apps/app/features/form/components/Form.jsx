import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import createForm from './createForm';
import FormItem from './FormItem';

const propTypes = {
  order: PropTypes.array.isRequired,
  items: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  valid: PropTypes.bool.isRequired,
};

const defaultProps = {};

class Form extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    const { values, errors, valid } = this.props;
    event.preventDefault();

    if (!valid) {
      alert(JSON.stringify(errors));
      return;
    }

    alert(JSON.stringify(values));
  }

  render() {
    const {
      order,
      items,
    } = this.props;

    return (
      <form onSubmit={this.handleSubmit} className="container" noValidate>
        {
          order.map(itemId => (
            <FormItem
              key={itemId}
              id={itemId}
              {...items[itemId]}
            />
          ))
        }

        <Button type="submit">Submit</Button>
      </form>
    );
  }
}

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;

export default createForm(Form);
