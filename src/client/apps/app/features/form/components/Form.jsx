import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as formModule from 'apps/app/shared/redux/forms';
import { Button } from 'reactstrap';
import FormItem from './FormItem';

const propTypes = {
  id: PropTypes.string.isRequired,
  order: PropTypes.array.isRequired,
  onSubmit: PropTypes.func,
};

const defaultProps = {
  onSubmit: () => {},
};

class Form extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    console.log(data);
  }

  render() {
    const { order, onSubmit, id: formId } = this.props;

    return (
      <form onSubmit={this.handleSubmit} className="container">
        {
          order.map(itemId => (
            <FormItem
              key={itemId}
              formId={formId}
              id={itemId}
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

function mapStateToProps(state, ownProps) {
  const { id } = ownProps;

  return {
    order: formModule.selectors.getItemsOrder(state, id),
  };
}

export default connect(mapStateToProps, null)(Form);
