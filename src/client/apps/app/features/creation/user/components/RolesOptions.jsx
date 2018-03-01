import React from 'react';
import locales from 'Locales/entities';

function RoleOptions() {
  const roles = locales.role;

  return (
    <React.Fragment>
      <option value=""></option>
      {
        Object.keys(roles).map(key => (
          <option key={key} value={key}>
            {roles[key]}
          </option>
        ))
      }
    </React.Fragment>
  );
}

export default RoleOptions;
