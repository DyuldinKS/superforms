import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Form from 'shared/form/components/Form';
import * as formsModule from 'apps/app/shared/redux/forms';

const propTypes = {
  id: PropTypes.string.isRequired,
  form: PropTypes.object,
  fetchForm: PropTypes.func.isRequired,
};

const defaultProps = {
  form: {},
};

class FormRoute extends Component {
  componentDidMount() {
    const { fetchForm, id } = this.props;
    fetchForm(id);
  }

  render() {
    const { form } = this.props;

    if (!form.scheme) {
      return 'Загрузка...';
    }

    return (
      <Form
        form={form}
      />
    );
  }
}

FormRoute.propTypes = propTypes;
FormRoute.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const formId = ownProps.match.params.id;
  const form = formsModule.selectors.getFormEntity(state, formId);

  return {
    form,
    id: formId,
  };
}

const mapDispatchToProps = {
  fetchForm: formsModule.actions.fetch,
};

export default connect(mapStateToProps, mapDispatchToProps)(FormRoute);
