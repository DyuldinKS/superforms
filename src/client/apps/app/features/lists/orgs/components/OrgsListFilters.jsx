import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import locales from 'Locales/entities';

const propTypes = {
  values: PropTypes.object,
  onChange: PropTypes.func,
};

const defaultProps = {
  values: {},
  onChange: () => {},
};

function OrgsListFilters(props) {
  const { onChange, values } = props;

  return (
    <div className="orgs-list-filters">
      <Form inline>
        <FormGroup>
          <Label>Статус:</Label>
          <Input
            type="select"
            size="sm"
            onChange={event => onChange('status', event.target.value)}
            value={values.status}
          >
            <option value="any">Любой</option>
            {
              Object.keys(locales.status).map(key => (
                <option value={key} key={key}>{locales.status[key]}</option>
              ))
            }
          </Input>
        </FormGroup>
      </Form>
    </div>
  );
}

OrgsListFilters.propTypes = propTypes;
OrgsListFilters.defaultProps = defaultProps;

export default OrgsListFilters;
