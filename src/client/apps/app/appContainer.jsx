import React from 'react';
import { withRouter, Switch, Route } from 'shared/router/components';

// Import layout components
import AppHeader from './features/header';

// Import routing pages
import CreateUserRoute from './features/creation/user/createUserRoute';
import CreateOrgRoute from './features/creation/org/createOrgRoute';
import UserProfileRoute from './features/profiles/user/userProfileRoute';
import OrgProfileRoute from './features/profiles/org/orgProfileRoute';

function App() {
  return (
    <div className="app">
      <AppHeader />

      <Switch>
        <Route
          path="/orgs/:orgId/users/new"
          exact
          component={CreateUserRoute}
        />
        <Route
          path="/orgs/:orgId/orgs/new"
          exact
          component={CreateOrgRoute}
        />
        <Route
          path="/users/:id"
          component={UserProfileRoute}
        />
        <Route
          path="/orgs/:id"
          component={OrgProfileRoute}
        />
      </Switch>
    </div>
  );
}

const WithRouter = withRouter(App);
export default WithRouter;
