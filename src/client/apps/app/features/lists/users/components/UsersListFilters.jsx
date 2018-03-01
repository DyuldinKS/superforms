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

function UsersListFilters(props) {
  const { onChange, values } = props;

  return (
    <div className="users-list-filters">
      <Form inline>
        <FormGroup>
          <Label>Роль:</Label>
          <Input
            type="select"
            size="sm"
            onChange={event => onChange('role', event.target.value)}
            value={values.role}
          >
            <option value="any">Любая</option>
            {
              Object.keys(locales.role).map(key => (
                <option value={key} key={key}>{locales.role[key]}</option>
              ))
            }
          </Input>
        </FormGroup>

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

UsersListFilters.propTypes = propTypes;
UsersListFilters.defaultProps = defaultProps;

export default UsersListFilters;
