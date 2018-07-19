import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import moment from 'moment';
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

const DATE_TEMPLATE = 'YYYY-MM-DD';
const DATETIME_TEMPLATE = `${DATE_TEMPLATE} hh:mm`;


class SettingsTab extends Component {
  setStopDate = (stop) => {
    this.props.onUpdate({
      ...this.props.collecting,
      stop,
    });
  }

  resumeCollecting = () => {
    this.setStopDate(null);
  }

  stopCollecting = () => {
    this.setStopDate(moment());
  }

  onStopDateChange = (event) => {
    const { value } = event.target;
    this.setStopDate(value ? moment(value) : null);
  }

  onRefillingClick = () => {
    const { collecting } = this.props;
    this.props.onUpdate({
      ...collecting,
      refilling: !collecting.refilling,
    });
  }

  render() {
    const { stop, start, refilling } = this.props.collecting;
    const { stopCollecting, resumeCollecting } = this;
    const isActive = !stop || moment().isBefore(stop);

    return (
      <Card body className="form-distribution-settings">
        <h3>
          Настройки сбора ответов <br />
          <small className="text-muted">
            Настройте доступ респондентов к странице заполнения
          </small>
        </h3>

        <FormGroup>
          <div>
            {`Начало сбора: ${moment(start).format(DATETIME_TEMPLATE)}`}
          </div>
          <div className="mb-1 form-inline">
            Окончание сбора:
            <Input
              bsSize="sm"
              type="date"
              value={stop ? moment(stop).format(DATE_TEMPLATE) : ''}
              onChange={this.onStopDateChange}
            />
          </div>

          <Button
            bsSize="sm"
            color="secondary"
            type="submit"
            outline
            onClick={isActive ? stopCollecting : resumeCollecting}
          >
            {
              isActive
                ? 'Остановить сбор ответов'
                : 'Возобновить сбор ответов'
            }
          </Button>
        </FormGroup>

        <FormGroup check>
          <Label check>
            <Input
              type="checkbox"
              name="refilling"
              checked={refilling}
              onChange={this.onRefillingClick}
              value="true"
            />
            Повторное заполнение опроса
          </Label>
        </FormGroup>
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
