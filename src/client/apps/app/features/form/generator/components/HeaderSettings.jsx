import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

const propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  updateHeader: PropTypes.func.isRequired,
};

const defaultProps = {
  title: PropTypes.string,
  description: PropTypes.string,
};

class HeaderSettings extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { target } = event;
    const { name, value } = target;
    const { updateHeader } = this.props;
    updateHeader(name, value);
  }

  render() {
    const {
      title,
      description,
      onClose,
    } = this.props;

    return (
      <div className="form-generator-side-bar item-settings">
        <header>
          <h2>Заголовок</h2>
          <Button size="sm" onClick={onClose}>Закрыть</Button>
        </header>

        <div className="item-settings-section">
          <FormGroup>
            <Label>Текст</Label>
            <Input
              bsSize="sm"
              type="textarea"
              rows="2"
              name="title"
              value={title}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Описание</Label>
            <Input
              bsSize="sm"
              type="textarea"
              rows="7"
              name="description"
              value={description}
              onChange={this.handleChange}
            />
          </FormGroup>
        </div>
      </div>
    );
  }
}

HeaderSettings.propTypes = propTypes;
HeaderSettings.defaultProps = defaultProps;

export default HeaderSettings;
