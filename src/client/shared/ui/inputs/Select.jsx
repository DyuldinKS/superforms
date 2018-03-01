import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from'reactstrap';

const propTypes = {
  id: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  })),
  value: PropTypes.string,
  onChange: PropTypes.func,
};

const defaultProps = {
  options: [],
  value: '',
  onChange: () => {},
};

class Select extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { onChange, id } = this.props;
    onChange(id, event);
  }

  render() {
    const { options, value } = this.props;

    return (
      <Input
        type="select"
        bsSize="sm"
        onChange={this.handleChange}
        value={value}
      >
        {
          options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        }
      </Input>
    );
  }
}

Select.propTypes = propTypes;
Select.defaultProps = defaultProps;

export default Select;
