import React from 'react';
import PropTypes from 'prop-types';

export default function connectInput(WrappedComponent) {
  const propTypes = {
    name: PropTypes.string.isRequired,
  };

  const contextTypes = {
    getInputProps: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
  };

  function ConnectedInput(props, context) {
    const { name } = props;
    const {
      getInputProps,
      handleChange,
    } = context;

    const inputProps = getInputProps(name);

    return (
      <WrappedComponent
        {...props}
        {...inputProps}
        onChange={handleChange}
      />
    );
  }

  const wrappedComponentName = WrappedComponent.displayName
    || WrappedComponent.name
    || 'Component';

  ConnectedInput.displayName = `connectInput(${wrappedComponentName})`;
  ConnectedInput.propTypes = propTypes;
  ConnectedInput.contextTypes = contextTypes;

  return ConnectedInput;
}
