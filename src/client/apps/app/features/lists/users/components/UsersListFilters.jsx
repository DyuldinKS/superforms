import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import locales from 'Locales/entities';
import { getActive, getRole } from 'apps/app/shared/utils/locales';

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
                <option value={key} key={key}>{getRole(key)}</option>
              ))
            }
          </Input>
        </FormGroup>

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

UsersListFilters.propTypes = propTypes;
UsersListFilters.defaultProps = defaultProps;

export default UsersListFilters;
