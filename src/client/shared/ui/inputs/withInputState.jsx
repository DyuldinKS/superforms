import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default function withInputState(WrappedComponent) {
  const propTypes = {
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
      this.setValue = this.setValue.bind(this);
    }

    handleChange(event) {
      const { value } = event.target;

      this.setState(state => ({
        ...state,
        value,
      }), () => this.props.onChange(this.state.value));
    }

    setValue(value) {
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
          handleChange={this.handleChange}
          setValue={this.setValue}
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
