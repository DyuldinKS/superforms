import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import Moment from 'moment';

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
        <p className="text-muted">
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
      <p className="text-muted">
        Сохранение...
      </p>
    );
  }

  renderSuccess() {
    const { lastSave } = this.props;
    const date = Moment(lastSave).format(`${dateFormat} ${timeFormat}`);

    return (
      <p className="text-muted">
        {`Все изменения сохранены (${date})`}
      </p>
    );
  }

  render() {
    const { hasUnsavedChanges, updating } = this.props;

    return (
      <div className="form-generator-save-panel">
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
