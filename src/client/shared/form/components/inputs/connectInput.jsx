import React from 'react';
import PropTypes from 'prop-types';

export default function connectInput(WrappedComponent) {
  const propTypes = {
    name: PropTypes.string.isRequired,
  };

  const contextTypes = {
    getInputProps: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    setValue: PropTypes.func.isRequired,
  };

  function ConnectedInput(props, context) {
    const { name } = props;
    const {
      getInputProps,
      setError,
      setValue,
    } = context;

    const inputProps = getInputProps(name);

    return (
      <WrappedComponent
        {...props}
        {...inputProps}
        setError={setError}
        setValue={setValue}
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
