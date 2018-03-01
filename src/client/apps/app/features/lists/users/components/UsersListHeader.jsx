import React from 'react';
import PropTypes from 'prop-types';
import { EntriesListHeader } from 'shared/ui/list';

const propTypes = {};

const defaultProps = {};

function UsersListHeader() {
  return (
    <EntriesListHeader>
      <div className="users-list-header-cell-fullname">
        ФИО
      </div>
      <div className="users-list-header-cell-org">
        Организация
      </div>
      <div className="users-list-header-cell-role">
        Роль
      </div>
      <div className="users-list-header-cell-status">
        Статус
      </div>
    </EntriesListHeader>
  );
}

UsersListHeader.propTypes = propTypes;
UsersListHeader.defaultProps = defaultProps;

export default UsersListHeader;
