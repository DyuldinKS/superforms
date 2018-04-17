import React from 'react';
import PropTypes from 'prop-types';
import { EntriesListHeader } from 'shared/ui/list';

const propTypes = {};

const defaultProps = {};

function OrgFormsListHeader() {
  return (
    <EntriesListHeader>
      <div className="forms-list-header-cell-id">
        ID
      </div>
      <div className="forms-list-header-cell-title">
        Наименование
      </div>
      <div className="forms-list-header-cell-owner">
        Автор
      </div>
      <div className="forms-list-header-cell-created">
        Дата создания
      </div>
      <div className="forms-list-header-cell-responses">
        Ответы
      </div>
    </EntriesListHeader>
  );
}

OrgFormsListHeader.propTypes = propTypes;
OrgFormsListHeader.defaultProps = defaultProps;

export default OrgFormsListHeader;
