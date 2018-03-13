import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default function withInputState(WrappedComponent) {
  const propTypes = {
    name: PropTypes.string.isRequired,
    initialValue: PropTypes.string,
    onChange: PropTypes.func,
  };

  const defaultProps = {
    initialValue: '',
    onChange: () => {},
  };

  class WithInputState extends Component {
    constructor(props) {
      super(props);

      this.state = {
        value: props.initialValue,
      };

      this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
      const { value } = event.target;

      this.setState(state => ({
        ...state,
        value,
      }), () => this.props.onChange(this.state.value));
    }

    render() {
      const {
        onChange,
        ...props
      } = this.props;

      return (
        <WrappedComponent
          {...props}
          value={this.state.value}
          onChange={this.handleChange}
        />
      );
    }
  }

  const wrappedComponentName = WrappedComponent.displayName
    || WrappedComponent.name
    || 'Component';

  WithInputState.displayName = `withInputState(${wrappedComponentName})`;
  WithInputState.propTypes = propTypes;
  WithInputState.defaultProps = defaultProps;

  return WithInputState;
}
