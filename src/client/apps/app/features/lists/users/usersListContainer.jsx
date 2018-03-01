import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import debounce from 'throttle-debounce/debounce';
import { Card, CardHeader } from 'reactstrap';
import { EntriesList } from 'shared/ui/list';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import { InputSearch } from 'shared/ui/inputs';
import { Link } from 'shared/router/components';
import {
  UsersListHeader,
  UsersListItem,
  UsersListFilters,
} from './components';

const propTypes = {
  orgId: PropTypes.string.isRequired,
  fetchList: PropTypes.func.isRequired,
  // from Redux
  entries: PropTypes.arrayOf(PropTypes.string),
  search: PropTypes.string,
  filters: PropTypes.object,
};

const defaultProps = {
  entries: [],
  search: undefined,
  filters: {},
};

class UsersListContainer extends Component {
  constructor(props) {
    super(props);

    this.handleSearch = this.handleSearch.bind(this);
    this.handleSearchDebounced = debounce(300, this.handleSearch);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  componentDidMount() {
    this.props.fetchList();
  }

  handleSearch(search) {
    const { filters, fetchList } = this.props;

    fetchList({
      filters,
      search: (search && search.length !== 0)
        ? search
        : undefined,
    });
  }

  handleFilterChange(key, value) {
    const { search, filters, fetchList } = this.props;

    fetchList({
      search,
      filters: {
        ...filters,
        [key]: (value !== 'any')
          ? value
          : undefined,
      },
    });
  }

  render() {
    const { orgId, entries, filters } = this.props;

    return (
      <Card className="users-list-container">
        <CardHeader>
          <div className="users-list-search">
            <InputSearch
              placeholder="Поиск среди пользователей"
              onChange={this.handleSearchDebounced}
            />
          </div>

          <Link
            to={`/orgs/${orgId}/users/new`}
            className="btn btn-primary users-list-btn-add"
          >
            Добавить нового пользователя
          </Link>

          <UsersListFilters
            values={filters}
            onChange={this.handleFilterChange}
          />
        </CardHeader>

        <UsersListHeader />
        <EntriesList
          entries={entries}
          EntryComponent={UsersListItem}
        />
      </Card>
    );
  }
}

UsersListContainer.propTypes = propTypes;
UsersListContainer.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { orgId } = ownProps;
  const {
    entries,
    search,
    filters,
  } = orgsModule.selectors.getAffiliatedUsersList(state, orgId);

  return {
    entries,
    search,
    filters,
  };
}

export default connect(mapStateToProps, null)(UsersListContainer);
