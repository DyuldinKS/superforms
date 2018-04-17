import { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'throttle-debounce/debounce';

export const propTypes = {
  fetchList: PropTypes.func.isRequired,
  // from Redux
  entries: PropTypes.arrayOf(PropTypes.string),
  search: PropTypes.string,
  filters: PropTypes.object,
};

export const defaultProps = {
  entries: [],
  search: undefined,
  filters: {},
};

class FormsListContainer extends Component {
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
    return null;
  }
}

FormsListContainer.propTypes = propTypes;
FormsListContainer.defaultProps = defaultProps;

export default FormsListContainer;
