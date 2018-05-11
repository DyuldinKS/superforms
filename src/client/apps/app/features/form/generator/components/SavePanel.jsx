import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import Moment from 'moment';
import classNames from 'classnames';

const propTypes = {
  hasUnsavedChanges: PropTypes.bool,
  lastSave: PropTypes.string,
  onSave: PropTypes.func,
  updating: PropTypes.bool,
};

const defaultProps = {
  hasUnsavedChanges: false,
  lastSave: '',
  onSave: () => {},
  updating: false,
};

const dateFormat = 'DD.MM.YYYY';
const timeFormat = 'HH:mm';

class SavePanel extends Component {
  renderHasChanges() {
    const { onSave } = this.props;

    return (
      <React.Fragment>
        <p>
          Есть несохраненные изменения{' '}
        </p>
        <Button color="link" onClick={onSave} >
          Сохранить
        </Button>
      </React.Fragment>
    );
  }

  renderPending() {
    return (
      <p>
        Сохранение...
      </p>
    );
  }

  renderSuccess() {
    const { lastSave } = this.props;
    const date = !!lastSave
      ? Moment(lastSave).format(`(${dateFormat} ${timeFormat})`)
      : '';

    return (
      <p>
        {`Все изменения сохранены ${date}`}
      </p>
    );
  }

  render() {
    const { hasUnsavedChanges, updating } = this.props;
    const className = classNames({
      'form-generator-save-panel': true,
      alert: true,
      'alert-warning': hasUnsavedChanges,
      'alert-success': !hasUnsavedChanges,
    });

    return (
      <div className={className}>
        {
          updating
          ? this.renderPending()
          : hasUnsavedChanges
            ? this.renderHasChanges()
            : this.renderSuccess()
        }
      </div>
    );
  }
}

SavePanel.propTypes = propTypes;
SavePanel.defaultProps = defaultProps;

export default SavePanel;
