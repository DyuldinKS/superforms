import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import * as formsModule from 'apps/app/shared/redux/forms';

const propTypes = {
  collecting: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  // from Redux
  updating: PropTypes.bool,
};

const defaultProps = {
  collecting: {},
  // from Redux
  updating: false,
};

const defaultState = {
  inactive: false,
  expires: false,
  expireDate: '',
  refilling: false,
};

function transformPropsToState(props) {
  const state = {
    ...defaultState,
    inactive: !!props.inactive,
    refilling: !!props.refilling,
  };

  if (props.expires) {
    state.expireDate = props.expires;
    state.expires = true;
  }

  return state;
}

function transformStateToPayload(state) {
  const {
    expires,
    expireDate,
    ...payload
  } = state;

  if (expires && expireDate) {
    payload.expires = expireDate;
  } else {
    payload.expires = false;
  }

  return payload;
}

class SettingsTab extends Component {
  constructor(props) {
    super(props);

    this.state = transformPropsToState(props.collecting);

    this.handleChange = this.handleChange.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => transformPropsToState(nextProps.collecting));
  }

  getValue(name) {
    return this.state[name];
  }

  handleChange(event) {
    const { target } = event;
    const { name, value } = target;

    this.setState(state => ({
      ...state,
      [name]: value,
    }));
  }

  handleRadioChange(event) {
    const { target } = event;
    const { name, value } = target;

    this.setState(state => ({
      ...state,
      [name]: value === 'true',
    }));
  }

  handleSubmit(event) {
    event.preventDefault();
    const { onUpdate, updating } = this.props;

    if (updating) {
      return;
    }

    const payload = transformStateToPayload(this.state);
    onUpdate(payload);
  }

  render() {
    return (
      <Card body className="form-distribution-settings">
        <h3>
          Настройки сбора ответов <br />
          <small className="text-muted">
            Настройте доступ респондентов к странице заполнения
          </small>
        </h3>

        <Form onSubmit={this.handleSubmit}>
          <FormGroup tag="fieldset">
            <Label><strong>Сбор ответов</strong></Label>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="inactive"
                  checked={!this.getValue('inactive')}
                  onChange={this.handleRadioChange}
                  value="false"
                />
                Активен
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="inactive"
                  checked={this.getValue('inactive')}
                  onChange={this.handleRadioChange}
                  value="true"
                />
                Остановлен
              </Label>
            </FormGroup>
          </FormGroup>

          <FormGroup tag="fieldset">
            <Label><strong>Срок сбора ответов</strong></Label>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="expires"
                  checked={!this.getValue('expires')}
                  onChange={this.handleRadioChange}
                  value="false"
                />
                Не ограничен
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="expires"
                  checked={this.getValue('expires')}
                  onChange={this.handleRadioChange}
                  value="true"
                />
                <div className="form-inline">
                  До:
                  <Input
                    bsSize="sm"
                    type="date"
                    name="expireDate"
                    value={this.getValue('expireDate')}
                    onChange={this.handleChange}
                    style={{ marginLeft: '10px' }}
                  />
                </div>
              </Label>
            </FormGroup>
          </FormGroup>

          <FormGroup tag="fieldset">
            <Label><strong>Повторное заполнение формы</strong></Label>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="refilling"
                  checked={this.getValue('refilling')}
                  onChange={this.handleRadioChange}
                  value="true"
                />
                Разрешено
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="refilling"
                  checked={!this.getValue('refilling')}
                  onChange={this.handleRadioChange}
                  value="false"
                />
                Запрещено
              </Label>
            </FormGroup>
          </FormGroup>

          <Button
            color="primary"
            type="submit"
          >
            {
              this.props.updating
              ? 'Сохранение...'
              : 'Сохранить'
            }
          </Button>
        </Form>
      </Card>
    );
  }
}

SettingsTab.propTypes = propTypes;
SettingsTab.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { id } = ownProps;
  const { updating } = formsModule.selectors.getFormEntity(state, id);

  return {
    updating,
  };
}

export default connect(mapStateToProps, null)(SettingsTab);
