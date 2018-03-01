import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import getSubpath from 'shared/router/utils/getSubpath';
import Page, { PageHeader, PageNav, PageContent } from 'shared/ui/page';
import { Switch, Route } from 'shared/router/components';
import * as usersModule from 'apps/app/shared/redux/users';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import {
  UserProfileHeader,
  UserProfileInfo,
  UserProfileNav,
  UserProfileSettings,
} from './components';

const propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  // from Redux
  id: PropTypes.string.isRequired,
  user: PropTypes.object,
  org: PropTypes.object,
  fetchUser: PropTypes.func.isRequired,
};

const defaultProps = {
  user: {},
  org: {},
};

class UserProfilePage extends Component {
  componentDidMount() {
    const { id, fetchUser } = this.props;
    fetchUser(id);
  }

  render() {
    const {
      org,
      user,
      match,
      location,
    } = this.props;
    const { path, url } = match;
    const subpath = getSubpath(location.pathname, url);

    return (
      <Page>
        <div className="app-profile-header-outer">
          <div className="container">
            <UserProfileHeader
              user={user}
              org={org}
            />

            <UserProfileNav
              baseUrl={url}
              subpath={subpath}
            />
          </div>
        </div>

        <PageContent className="container app-profile-content">
          <Switch>
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
  const userId = ownProps.match.params.id;
  const user = usersModule.selectors.getUser(state, userId);
  const org = orgsModule.selectors.getOrg(state, user.entity.orgId);

  return {
    id: userId,
    user: user.entity,
    org: org.entity,
  };
}

const mapDispatchToProps = {
  fetchUser: usersModule.actions.fetchOne,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfilePage);
