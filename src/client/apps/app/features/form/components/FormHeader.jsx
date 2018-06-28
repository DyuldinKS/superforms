import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { selectors as formQuery } from 'apps/app/shared/redux/forms';

const propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

function FormHeader({ id, title }) {
  return (
    <div className="form-generator-header">
      <small className="text-muted">Форма № {id}</small>
      <h1 className="h3" title={title}>
        {title}
      </h1>
    </div>
  );
}

FormHeader.propTypes = propTypes;
FormHeader.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { id } = ownProps;
  const { title } = formQuery.getFormEntity(state, id);

  return {
    title,
  };
}

export default connect(mapStateToProps)(FormHeader);
