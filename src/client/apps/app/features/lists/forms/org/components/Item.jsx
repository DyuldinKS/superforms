import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { Link } from 'shared/router/components';
import * as formsModule from 'apps/app/shared/redux/forms';
import * as usersModule from 'apps/app/shared/redux/users';

const propTypes = {
  id: PropTypes.string.isRequired,
  // from Redux
  created: PropTypes.string,
  ownerFull: PropTypes.string,
  ownerShort: PropTypes.string,
  responseCount: PropTypes.number,
  title: PropTypes.string,
};

const defaultProps = {
  created: '',
  ownerFull: '',
  ownerShort: '',
  responseCount: 0,
  title: '',
};

const dateFormat = 'DD.MM.YYYY';
const timeFormat = 'HH:mm';

function OrgFormsListItem(props) {
  const {
    created,
    id,
    ownerFull,
    ownerShort,
    responseCount,
    title,
  } = props;

  return (
    <React.Fragment>
      <div className="forms-list-item-cell-id">
        {id}
      </div>
      <div className="forms-list-item-cell-title" title={title}>
        <Link
          to={`/form/${id}`}
        >
          {title}
        </Link>
      </div>
      <div className="forms-list-item-cell-owner" title={ownerFull}>
        {ownerShort}
      </div>
      <div className="forms-list-item-cell-created">
        {Moment(created).format(`${dateFormat} ${timeFormat}`)}
      </div>
      <div className="forms-list-item-cell-responses">
        {responseCount || 0}
      </div>
    </React.Fragment>
  );
}

OrgFormsListItem.propTypes = propTypes;
OrgFormsListItem.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const formId = ownProps.id;
  const form = formsModule.selectors.getFormEntity(state, formId);
  const {
    created,
    ownerId,
    responseCount,
    title,
  } = form;
  const ownerFull = usersModule.selectors.getFullName(state, ownerId);
  const ownerShort = usersModule.selectors.getShortName(state, ownerId);

  return {
    created,
    ownerFull,
    ownerShort,
    responseCount,
    title,
  };
}

export default connect(mapStateToProps, null)(OrgFormsListItem);
