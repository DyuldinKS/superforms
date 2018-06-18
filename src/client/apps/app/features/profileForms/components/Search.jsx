import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  Input,
  InputGroup,
} from 'reactstrap';
import * as sessionModule from 'apps/app/shared/redux/session';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import * as usersModule from 'apps/app/shared/redux/users';
import { constants } from '../utils/scopeTabs';

const propTypes = {
  scope: PropTypes.string.isRequired,
  search: PropTypes.string,
  searchForms: PropTypes.func,
};

const defaultProps = {
  search: '',
  searchForms: () => {},
};

class FormsSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      search: props.search,
    };

    this.handleChange = this.handleChange.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.search !== this.props.search) {
      this.setState(() => ({ search: nextProps.search }));
    }
  }

  handleChange(event) {
    const { value } = event.target;
    this.setState(() => ({ search: value }));
    this.props.searchForms(value);
  }

  clearSearch() {
    this.setState(() => ({ search: '' }));
    this.props.searchForms();
  }

  getPlaceholder() {
    const { scope } = this.props;

    switch (scope) {
      case constants.ORG:
        return 'Поиск по названию или автору';

      default:
        return 'Поиск по названию';
    }
  }

  renderClearButton() {
    return (
      <div className="input-group-append">
        <Button onClick={this.clearSearch}>
          <span>&#10006;</span>
        </Button>
      </div>
    );
  }

  render() {
    const { search } = this.state;

    return (
      <FormGroup className="profile-forms-search">
        <InputGroup>
          <Input
            bsSize="lg"
            placeholder={this.getPlaceholder()}
            value={search}
            onChange={this.handleChange}
          />
          {
            search
            ? this.renderClearButton()
            : null
          }
        </InputGroup>
      </FormGroup>
    );
  }
}

FormsSearch.propTypes = propTypes;
FormsSearch.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { scope } = ownProps;
  let passSearch = '';

  if (scope === constants.ORG) {
    const orgId = sessionModule.selectors.getOrgId(state);
    const { search } = orgsModule.selectors.getFormsList(state, orgId);
    passSearch = search;
  } else if (scope === constants.USER) {
    const userId = sessionModule.selectors.getUserId(state);
    const { search } = usersModule.selectors.getFormsList(state, userId);
    passSearch = search;
  }

  return {
    search: passSearch,
  };
}

export default connect(mapStateToProps, null)(FormsSearch);
