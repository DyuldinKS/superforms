import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  FormText,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

const defaultProps = {};

class SelectOptionsTextareaModal extends Component {
  constructor(props) {
    super(props);

    this.handleSave = this.handleSave.bind(this);
  }

  handleSave() {
    const { onAdd } = this.props;
    const prompt = this.input.value;
    onAdd(prompt);
  }

  render() {
    const { closeModal } = this.props;

    return (
      <Modal
        isOpen
        backdrop="static"
        className="modal-dialog-centered"
        size="lg"
        toggle={closeModal}
      >
        <ModalHeader toggle={closeModal}>
          Добавление вариантов ответа списком
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Input
              innerRef={(node) => { this.input = node; }}
              type="textarea"
              name="options"
              rows="7"
            />
            <FormText>Каждый вариант ответа должен начинаться с новой строки</FormText>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.handleSave}>Добавить</Button>
          {' '}
          <Button color="secondary" onClick={closeModal}>Отменить</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

SelectOptionsTextareaModal.propTypes = propTypes;
SelectOptionsTextareaModal.defaultProps = defaultProps;

export default SelectOptionsTextareaModal;
