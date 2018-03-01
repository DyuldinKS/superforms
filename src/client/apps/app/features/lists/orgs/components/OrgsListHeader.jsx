import React from 'react';
import PropTypes from 'prop-types';
import { EntriesListHeader } from 'shared/ui/list';

const propTypes = {};

const defaultProps = {};

function OrgsListHeader() {
  return (
    <EntriesListHeader>
      <div className="orgs-list-header-cell-name">
        Наименование
      </div>
      <div className="orgs-list-header-cell-chief">
        Надведомство
      </div>
      <div className="orgs-list-header-cell-status">
        Статус
      </div>
    </EntriesListHeader>
  );
}

OrgsListHeader.propTypes = propTypes;
OrgsListHeader.defaultProps = defaultProps;

export default OrgsListHeader;
