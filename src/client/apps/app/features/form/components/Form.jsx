import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import createForm from './createForm';
import FormItem from './FormItem';

const propTypes = {
  errors: PropTypes.object.isRequired,
  getRef: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  items: PropTypes.object.isRequired,
  order: PropTypes.array.isRequired,
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
    const {
      getRef,
      items,
      order,
    } = this.props;

    return (
      <form
        className="container"
        ref={getRef}
        noValidate
        onSubmit={this.handleSubmit}
      >
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
