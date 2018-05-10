import React from 'react';
import PropTypes from 'prop-types';
import { constants } from '../utils/statusTabs';

const propTypes = {
  statusFilter: PropTypes.string,
};

const defaultProps = {};

function getOptionalCols(statusFilter) {
  switch (statusFilter) {
    case constants.ACTIVE:
      return (
        <React.Fragment>
          <div className="profile-forms-item-col col3">
            Истекает
          </div>
          <div className="profile-forms-item-col col4">
            Ответы
          </div>
        </React.Fragment>
      );

    case constants.ALL:
      return (
        <React.Fragment>
          <div className="profile-forms-item-col col3">
            Статус
          </div>
          <div className="profile-forms-item-col col4">
            Ответы
          </div>
        </React.Fragment>
      );

    case constants.INACTIVE:
      return (
        <React.Fragment>
          <div className="profile-forms-item-col col4">
            Ответы
          </div>
        </React.Fragment>
      );

    default:
      return (
        <div className="profile-forms-item-col col4">
          Дата создания
        </div>
      );
  }
}

function FormsListHeader(props) {
  const { statusFilter } = props;

  return (
    <div
      className="
        profile-forms-item
        profile-forms-item-row
        profile-forms-list-header
        bg-light"
    >
      <div className="profile-forms-item-col col1">#</div>
      <div className="profile-forms-item-col col2">Название</div>
      {getOptionalCols(statusFilter)}
      <div className="profile-forms-item-col col5" />
    </div>
  );
}

FormsListHeader.propTypes = propTypes;
FormsListHeader.defaultProps = defaultProps;

export default FormsListHeader;
