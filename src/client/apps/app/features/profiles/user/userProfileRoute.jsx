import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import getSubpath from 'shared/router/utils/getSubpath';
import Page, { PageHeader, PageNav, PageContent } from 'shared/ui/page';
import { Switch, Route } from 'shared/router/components';
import * as usersModule from 'apps/app/shared/redux/users';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import {
  UserProfileBreadcrumb,
  UserProfileFormsList,
  UserProfileHeader,
  UserProfileInfo,
  UserProfileNav,
  UserProfileSettings,
} from './components';

const propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  // from Redux
  id: PropTypes.number.isRequired,
  fullName: PropTypes.string,
  org: PropTypes.object,
  fetchUser: PropTypes.func.isRequired,
};

const defaultProps = {
  fullName: '',
  org: {},
};

class UserProfilePage extends Component {
  componentDidMount() {
    const { id, fetchUser } = this.props;
    fetchUser(id);
  }

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      this.props.fetchUser(this.props.id);
    }
  }

  render() {
    const {
      id,
      org,
      fullName,
      match,
      location,
    } = this.props;
    const { path, url } = match;
    const subpath = getSubpath(location.pathname, url);

    return (
      <Page>
        <UserProfileBreadcrumb id={id} />

        <div className="app-profile-header-outer">
          <div className="container">
            <UserProfileHeader
              header={fullName}
            />

            <UserProfileNav
              baseUrl={url}
              id={id}
              subpath={subpath}
            />
          </div>
        </div>

        <PageContent className="container app-profile-content">
          <Switch>
            <Route
              path={`${path}/forms`}
              exact
              component={UserProfileFormsList}
            />
            <Route
              path={`${path}/settings`}
              exact
              component={UserProfileSettings}
            />
            <Route
              path={path}
              component={UserProfileInfo}
            />
          </Switch>
        </PageContent>
      </Page>
    );
  }
}

UserProfilePage.propTypes = propTypes;
UserProfilePage.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const userId = Number(ownProps.match.params.id);
  const fullName = usersModule.selectors.getFullName(state, userId);
  const { orgId } = usersModule.selectors.getUserEntity(state, userId);
  const org = orgsModule.selectors.getOrg(state, orgId);

  return {
    id: userId,
    fullName,
    org: org.entity,
  };
}

const mapDispatchToProps = {
  fetchUser: usersModule.actions.fetchOne,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfilePage);
