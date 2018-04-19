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
  OrgsListHeader,
  OrgsListItem,
  OrgsListFilters,
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

class OrgsListContainer extends Component {
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
      <Card className="orgs-list-container">
        <CardHeader>
          <div className="orgs-list-search">
            <InputSearch
              placeholder="Поиск среди организаций"
              onChange={this.handleSearchDebounced}
            />
          </div>

          <Link
            to={`/org/${orgId}/orgs/new`}
            className="btn btn-primary orgs-list-btn-add"
          >
            Добавить новую организацию
          </Link>

          <OrgsListFilters
            values={filters}
            onChange={this.handleFilterChange}
          />
        </CardHeader>

        <OrgsListHeader />
        <EntriesList
          entries={entries}
          EntryComponent={OrgsListItem}
        />
      </Card>
    );
  }
}

OrgsListContainer.propTypes = propTypes;
OrgsListContainer.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { orgId } = ownProps;
  const {
    entries,
    search,
    filters,
  } = orgsModule.selectors.getAffiliatedOrgsList(state, orgId);

  return {
    entries,
    search,
    filters,
  };
}

export default connect(mapStateToProps, null)(OrgsListContainer);
