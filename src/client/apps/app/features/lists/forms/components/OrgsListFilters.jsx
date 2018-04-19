import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import { getActive } from 'apps/app/shared/utils/locales';

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
            onChange={event => onChange('active', event.target.value)}
            value={values.active}
          >
            <option value="any">Любой</option>
            <option value={true} key="true">{getActive(true)}</option>
            <option value={false} key="false">{getActive(false)}</option>
          </Input>
        </FormGroup>
      </Form>
    </div>
  );
}

OrgsListFilters.propTypes = propTypes;
OrgsListFilters.defaultProps = defaultProps;

export default OrgsListFilters;
