import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import * as sessionModule from 'apps/app/shared/redux/session';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import * as usersModule from 'apps/app/shared/redux/users';
import * as formsModule from 'apps/app/shared/redux/forms';
import FormItem from './FormItem';
import FormsListHeader from './FormsListHeader';
import { constants } from '../utils/scopeTabs';
import filterByStatus from '../utils/filterByStatus';

const propTypes = {
  statusFilter: PropTypes.string,
  scope: PropTypes.string,
  list: PropTypes.array,
  loading: PropTypes.bool,
  amount: PropTypes.number,
  display: PropTypes.number,
  showMoreItems: PropTypes.func.isRequired,
};

const defaultProps = {
  list: [],
  loading: true,
  amount: 0,
};

function FormsList(props) {
  const {
    amount,
    display,
    loading,
    scope,
    statusFilter,
    showMoreItems,
  } = props;

  return (
    <div className="profile-forms-list">
      <FormsListHeader
        statusFilter={statusFilter}
      />

      {
        !loading && props.list.map(item => (
          <FormItem
            key={item.id}
            statusFilter={statusFilter}
            scope={scope}
            item={item}
          />
        ))
      }

      {
        loading
        ? <div className="text-center">
            Загрузка...
          </div>
        : null
      }

      {
        !loading && amount < 1
        ? <div className="text-center">
            Нет форм
          </div>
        : null
      }

      {
        !loading && amount > display
        ? <div className="text-center">
            <Button onClick={showMoreItems}>
              Показать больше
            </Button>
          </div>
        : null
      }
    </div>
  );
}

FormsList.propTypes = propTypes;
FormsList.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { scope, statusFilter, display } = ownProps;
  let list = [];
  let loading = false;

  if (scope === constants.ORG) {
    const orgId = sessionModule.selectors.getOrgId(state);
    const {
      entries,
      fetchStatus,
    } = orgsModule.selectors.getFormsList(state, orgId);
    list = entries;
    loading = fetchStatus === 'loading';
  } else if (scope === constants.USER) {
    const userId = sessionModule.selectors.getUserId(state);
    const {
      entries,
      fetchStatus,
    } = usersModule.selectors.getFormsList(state, userId);
    list = entries;
    loading = fetchStatus === 'loading';
  }

  list = list.map(id => formsModule.selectors.getFormEntity(state, id));
  list = filterByStatus(list, statusFilter);
  const amount = list.length;
  list = list.slice(0, display);

  return {
    list: filterByStatus(list, statusFilter).slice(0, display),
    loading,
    amount,
  };
}

export default connect(mapStateToProps, null)(FormsList);
