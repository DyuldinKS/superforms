import React from 'react';
import PropTypes from 'prop-types';
import { UncontrolledAlert } from 'reactstrap';

const propTypes = {
  message: PropTypes.string,
};

const defaultProps = {
  message: 'Текст ошибки не предоставлен',
};

function ErrorPanel(props) {
  return (
    <UncontrolledAlert
      color="danger"
      className="app-creation-form-submit-error"
    >
      {props.message}
    </UncontrolledAlert>
  );
}

ErrorPanel.propTypes = propTypes;
ErrorPanel.defaultProps = defaultProps;

export default ErrorPanel;
