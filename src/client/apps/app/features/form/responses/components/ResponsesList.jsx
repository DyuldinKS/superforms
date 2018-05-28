import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'reactstrap';
import Moment from 'moment';

const propTypes = {
  entries: PropTypes.array,
  onSelect: PropTypes.func.isRequired,
};

const defaultProps = {
  entries: [],
};

const dateFormat = 'DD.MM.YYYY HH:mm';

function ResponsesList(props) {
  const { entries, onSelect } = props;

  return (
    <Card className="form-responses-list">
      <div className="form-responses-list-header">
        <div className="list-header-cell">
          #
        </div>
        <div className="list-header-cell">
          Дата получения
        </div>
        <div className="list-header-cell">
          Респондент
        </div>
        <div className="list-header-cell">
          Ответ
        </div>
      </div>
      <div className="form-responses-list-body">
        {
          entries.map((entry, index) => (
            <div key={entry.id} className="form-responses-list-item">
              <div className="list-item-cell">
                {entries.length - index}
              </div>
              <div className="list-item-cell">
                {Moment(entry.created).format(dateFormat)}
              </div>
              <div className="list-item-cell">
                {entry.respondent.ip || 'Нет данных'}
              </div>
              <div className="list-item-cell">
                <a href="#" onClick={() => onSelect(entry.id)}>
                  Показать
                </a>
              </div>
            </div>
          ))
        }
      </div>
    </Card>
  );
}

ResponsesList.propTypes = propTypes;
ResponsesList.defaultProps = defaultProps;

export default ResponsesList;
