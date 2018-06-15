import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  FormGroup,
  Input,
  InputGroup,
  Popover,
  PopoverBody,
} from 'reactstrap';

const propTypes = {
  id: PropTypes.string.isRequired,
  shared: PropTypes.string.isRequired,
};

const defaultProps = {};

class FormDistributionByLink extends Component {
  constructor(props) {
    super(props);

    this.state = {
      popover: false,
    };

    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.showPopover = this.showPopover.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
  }

  copyToClipboard() {
    this.linkInput.select();

    try {
      document.execCommand('copy');
      this.showPopover();
    } catch (error) {
      console.error(error);
      alert('Ваш бразуер не поддерживает автоматическое копирование. Пожалуйста, скопируйте ссылку вручную.');
    }
  }

  showPopover() {
    this.setState(state => ({
      ...state,
      popover: true,
    }));
  }

  togglePopover() {
    this.setState(state => ({
      ...state,
      popover: !state.popover,
    }));
  }

  getLinkValue() {
    const { id, shared } = this.props;
    const origin = typeof window !== 'undefined'
      ? window.location.origin
      : '';
    return `${origin}/form/${id}?s=${shared}`;
  }

  renderPopover() {
    return (
      <Popover
        placement="bottom"
        isOpen
        target={this.linkInput}
        toggle={this.togglePopover}
      >
        <PopoverBody>
          Скопировано в буффер обмена
        </PopoverBody>
      </Popover>
    );
  }

  render() {
    return (
      <Card body className="form-distribution-public-link-container">
        <h3>
          Ссылка на форму <br />
          <small className="text-muted">
            Скопируйте и отправьте респондентам ссылку
          </small>
        </h3>
        <FormGroup className="form-distribution-public-link">
          <InputGroup>
            <Input
              bsSize="lg"
              type="text"
              name="title"
              readOnly
              innerRef={(input) => { this.linkInput = input; }}
              value={this.getLinkValue()}
            />
            <div className="input-group-append">
              <Button color="primary" onClick={this.copyToClipboard}>
                Копировать
              </Button>
            </div>
          </InputGroup>
          {
            this.state.popover
            ? this.renderPopover()
            : null
          }
        </FormGroup>
      </Card>
    );
  }
}

FormDistributionByLink.propTypes = propTypes;
FormDistributionByLink.defaultProps = defaultProps;

export default FormDistributionByLink;
