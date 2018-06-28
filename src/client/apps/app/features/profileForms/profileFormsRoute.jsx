import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import debounce from 'throttle-debounce/debounce';
import * as sessionModule from 'apps/app/shared/redux/session';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import * as usersModule from 'apps/app/shared/redux/users';
import withCreateFormModal from 'apps/app/shared/components/withCreateFormModal';
import Nav from './components/Nav';
import Search from './components/Search';
import FormsList from './components/FormsList';
import { defaultTab as defaultStatusTab } from './utils/statusTabs';
import { constants as scopes, defaultTab as defaultScopeTab } from './utils/scopeTabs';

const propTypes = {
  showCreateModal: PropTypes.func.isRequired,
};

const defaultProps = {};

const defaultVisibleItems = 10;

class ProfileFormsRoute extends Component {
  constructor(props) {
    super(props);

    this.state = {
      status: defaultStatusTab,
      scope: defaultScopeTab,
      visibleItems: defaultVisibleItems,
    };

    this.changeStatusFilter = this.changeStatusFilter.bind(this);
    this.changeScope = this.changeScope.bind(this);
    this.showMoreItems = this.showMoreItems.bind(this);
    this.fetchForms = this.fetchForms.bind(this);
    this.searchForms = this.searchForms.bind(this);
    this.searchFormsDebounced = debounce(300, this.searchForms);
  }

  componentDidMount() {
    this.fetchForms();
  }

  changeStatusFilter(tabItem) {
    this.setState(
      state => ({
        ...state,
        status: tabItem.tab,
        visibleItems: defaultVisibleItems,
      }),
      this.fetchForms,
    );
  }

  changeScope(scope) {
    this.setState(
      state => ({
        ...state,
        scope,
        visibleItems: defaultVisibleItems,
      }),
      this.fetchForms,
    );
  }

  fetchForms() {
    const { scope } = this.state;
    const { userId, orgId } = this.props;

    if (scope === scopes.USER) {
      this.props.fetchUserForms(userId);
    } else if (scope === scopes.ORG) {
      this.props.fetchOrgForms(orgId);
    }
  }

  searchForms(search) {
    const { scope } = this.state;
    const { userId, orgId } = this.props;

    if (scope === scopes.USER) {
      this.props.searchUserForms(userId, { search });
    } else if (scope === scopes.ORG) {
      this.props.searchOrgForms(orgId, { search });
    }
  }

  showMoreItems() {
    this.setState(state => ({
      ...state,
      visibleItems: state.visibleItems + 10,
    }));
  }

  render() {
    const { status, scope, visibleItems } = this.state;

    return (
      <div className="container profile-forms">
        <Button
          color="primary"
          size="lg"
          className="new"
          onClick={this.props.showCreateModal}
        >
          Новая форма
        </Button>
        <Search
          scope={scope}
          searchForms={this.searchFormsDebounced}
        />
        <Nav
          statusFilter={status}
          scope={scope}
          onStatusFilterChange={this.changeStatusFilter}
          onScopeChange={this.changeScope}
        />
        <div className="tab-content">
          <FormsList
            statusFilter={status}
            scope={scope}
            display={visibleItems}
            showMoreItems={this.showMoreItems}
          />
        </div>
      </div>
    );
  }
}

ProfileFormsRoute.propTypes = propTypes;
ProfileFormsRoute.defaultProps = defaultProps;

function mapStateToProps(state) {
  const userId = sessionModule.selectors.getUserId(state);
  const orgId = sessionModule.selectors.getOrgId(state);

  return {
    userId,
    orgId,
  };
}

const mapDispatchToProps = {
  fetchOrgForms: orgsModule.actions.fetchFormsNew,
  fetchUserForms: usersModule.actions.fetchFormsNew,
  searchOrgForms: orgsModule.actions.fetchForms,
  searchUserForms: usersModule.actions.fetchForms,
};

const WithCreateFormModal = withCreateFormModal(ProfileFormsRoute);
export default connect(mapStateToProps, mapDispatchToProps)(WithCreateFormModal);
