import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

const propTypes = {
  togglers: PropTypes.array,
  getValue: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

const defaultProps = {
  togglers: [],
};

function ItemSettingsTogglers(props) {
  const { togglers, getValue, onChange } = props;

  return (
    <div className="item-settings-section">
      <Label>Параметры ответа</Label>
      {
        togglers.map(({ name, title }) => (
          <FormGroup check key={name}>
            <Label check>
              <Input
                type="checkbox"
                name={name}
                checked={getValue(name)}
                onChange={onChange}
              />
              {title}
            </Label>
          </FormGroup>
        ))
      }
    </div>
  );
}

ItemSettingsTogglers.propTypes = propTypes;
ItemSettingsTogglers.defaultProps = defaultProps;

export default ItemSettingsTogglers;
