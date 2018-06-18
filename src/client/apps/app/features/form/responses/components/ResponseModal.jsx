import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import * as formsModule from 'apps/app/shared/redux/forms';
import * as respModule from 'apps/app/shared/redux/responses';
import createForm from 'shared/form/components/createForm';
import Form from 'shared/form/components/Form';

const propTypes = {
  hideModal: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  // from Redux
  form: PropTypes.object,
  response: PropTypes.object,
  fetchResponse: PropTypes.func.isRequired,
  // from createForm HOC
  getRef: PropTypes.func.isRequired,
  init: PropTypes.func.isRequired,
};

const defaultProps = {
  form: { scheme: { items: {}, order: [] } },
  response: {},
};

class FormResponseRoute extends Component {
  componentDidMount() {
    const { id, fetchResponse } = this.props;
    fetchResponse(id);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.response !== nextProps.response
      && Object.keys(nextProps.response).length > 0) {
      this.props.init(nextProps.response.items);
    }
  }

  render() {
    const { form, getRef, hideModal } = this.props;

    return (
      <Modal isOpen toggle={hideModal} className="form-responses-view-modal">
        <ModalHeader toggle={hideModal}>
          Просмотр ответа
        </ModalHeader>
        <ModalBody>
          <Form
            form={form}
            getRef={getRef}
            readOnly
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={hideModal}>Закрыть</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

FormResponseRoute.propTypes = propTypes;
FormResponseRoute.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { formId, respId } = ownProps;
  const form = formsModule.selectors.getFormEntity(state, formId);
  const response = respModule.selectors.getEntity(state, respId);

  return {
    id: respId,
    form,
    response,
  };
}

const mapDispatchToProps = {
  fetchResponse: respModule.actions.fetch,
};

const withForm = createForm(FormResponseRoute);
export default connect(mapStateToProps, mapDispatchToProps)(withForm);
