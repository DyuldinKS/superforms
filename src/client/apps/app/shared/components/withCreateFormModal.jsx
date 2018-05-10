import React, { Component } from 'react';
import CreateFormModal from './CreateFormModal';

export default function withCreateFormModal(WrappedComponent) {
  class WithCreateFormModal extends Component {
    constructor(props) {
      super(props);

      this.state = {
        isModalVisible: false,
      };

      this.hideModal = this.hideModal.bind(this);
      this.showModal = this.showModal.bind(this);
    }

    hideModal() {
      this.setState(() => ({ isModalVisible: false }));
    }

    showModal() {
      this.setState(() => ({ isModalVisible: true }));
    }

    renderModal() {
      return (
        <CreateFormModal
          closeModal={this.hideModal}
        />
      );
    }

    render() {
      return (
        <React.Fragment>
          {
            this.state.isModalVisible
            ? this.renderModal()
            : null
          }

          <WrappedComponent
            {...this.props}
            showCreateModal={this.showModal}
            hideCreateModal={this.hideModal}
          />
        </React.Fragment>
      );
    }
  }

  const wrappedComponentName = WrappedComponent.displayName
    || WrappedComponent.name
    || 'Component';

  WithCreateFormModal.displayName = `withCreateFormModal(${wrappedComponentName})`;

  return WithCreateFormModal;
}
