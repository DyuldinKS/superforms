import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

const propTypes = {
  hasUnsavedChanges: PropTypes.bool,
  onSave: PropTypes.func,
  updating: PropTypes.bool,
};

const defaultProps = {
  hasUnsavedChanges: false,
  onSave: () => {},
  updating: false,
};

function SavePanel(props) {
  const { hasUnsavedChanges, onSave, updating } = props;

  return (
    <div className="form-generator-save-panel">
      {
        updating
        ? <p className="text-info">
            Сохранение...
          </p>
        : hasUnsavedChanges
          ? <Button
              color="primary"
              onClick={onSave}
            >
              Сохранить
            </Button>
          : <p className="text-success">
              Все изменения сохранены
            </p>
      }
    </div>
  );
}

SavePanel.propTypes = propTypes;
SavePanel.defaultProps = defaultProps;

export default SavePanel;
