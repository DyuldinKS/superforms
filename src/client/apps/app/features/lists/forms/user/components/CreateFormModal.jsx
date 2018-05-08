import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  FormFeedback,
  FormGroup,
  FormText,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import RequiredAsterisk from 'shared/form/components/RequiredAsterisk';
import * as formsModule from 'apps/app/shared/redux/forms';

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  createForm: PropTypes.func.isRequired,
};

const defaultProps = {};

class CreateFormModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      uploading: false,
      validationError: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.hideValidationError = this.hideValidationError.bind(this);
    this.showValidationError = this.showValidationError.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
  }

  handleSubmitRequest() {
    this.setState((state) => ({
      ...state,
      uploading: true,
      uploadError: null,
    }));
  }

  handleSubmitSuccess() {
    this.setState((state) => ({
      ...state,
      uploading: false,
    }));
  }

  handleSubmitFailure(error) {
    this.setState((state) => ({
      ...state,
      uploading: false,
      uploadError: error,
    }));
  }

  async handleSubmit(event) {
    event.preventDefault();

    if (this.state.uploading) {
      return;
    }

    const data = new FormData(event.target);
    const title = (data.get('title') || "").trim();
    const description = (data.get('description') || "").trim();

    if (!title) {
      this.showValidationError();
      return;
    }

    const payload = { title };
    if (description) {
      payload.description = description;
    }

    this.handleSubmitRequest();
    const result = await this.props.createForm(payload);
    if (result.error) {
      this.handleSubmitFailure(result.payload);
    } else {
      this.handleSubmitSuccess();
    }
  }

  hideValidationError() {
    this.setState((state) => ({ ...state, validationError: false }));
  }

  showValidationError() {
    this.setState((state) => ({ ...state, validationError: true }));
  }

  handleTitleChange() {
    if (this.state.validationError) {
      this.hideValidationError();
    }
  }

  render() {
    const { closeModal } = this.props;
    const {
      uploading,
      uploadError,
      validationError,
    } = this.state;

    return (
      <Modal
        isOpen
        backdrop="static"
        className="modal-dialog-centered"
        size="lg"
        toggle={closeModal}
      >
        <Form
          innerRef={(node) => { this.form = node; }}
          onSubmit={this.handleSubmit}
        >
          <ModalHeader toggle={closeModal}>
            Создание новой формы
          </ModalHeader>
          <ModalBody>
              <FormGroup>
                <Label>Название<RequiredAsterisk /></Label>
                <Input
                  className={validationError ? 'is-invalid' : ''}
                  name="title"
                  onChange={this.handleTitleChange}
                />
                <FormFeedback>Не указано название</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label>Описание</Label>
                <Input
                  name="description"
                  type="textarea"
                  rows="3"
                />
              </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              type="submit"
              disabled={uploading}
            >
              {
                uploading
                  ? "Создание..."
                  : "Создать"
              }
            </Button>
            {' '}
            <Button color="secondary" onClick={closeModal}>Отменить</Button>
          </ModalFooter>
        </Form>
      </Modal>
    );
  }
}


CreateFormModal.propTypes = propTypes;
CreateFormModal.defaultProps = defaultProps;

const mapDispatchToProps = {
  createForm: formsModule.actions.create,
}

export default connect(null, mapDispatchToProps)(CreateFormModal);
