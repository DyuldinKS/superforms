import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Label,
  Form,
  FormGroup,
  Input,
} from 'reactstrap';

const propTypes = {
  fullName: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
};

const defaultProps = {
  onSubmit: () => {},
};

class ChangeOrgInfoForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fullName: props.fullName,
      label: props.label,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState(state => ({
      ...state,
      [name]: value,
    }));
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state);
  }

  getValue(name) {
    return this.state[name] || '';
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormGroup>
          <Label for="fullName">Полное наименование</Label>
          <Input
            name="fullName"
            type="textarea"
            value={this.getValue('fullName')}
            onChange={this.handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label for="label">Короткое наименование</Label>
          <Input
            name="label"
            value={this.getValue('label')}
            onChange={this.handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Button type="submit" color="primary">
            Применить
          </Button>
        </FormGroup>
      </Form>
    );
  }
}

ChangeOrgInfoForm.propTypes = propTypes;
ChangeOrgInfoForm.defaultProps = defaultProps;

export default ChangeOrgInfoForm;
