import React from 'react';
import { withRouter, Switch, Route } from 'shared/router/components';

// Import layout components
import AppHeader from './features/header';

// Import routing pages
import CreateUserRoute from './features/creation/user/createUserRoute';
import CreateOrgRoute from './features/creation/org/createOrgRoute';
import UserProfileRoute from './features/profiles/user/userProfileRoute';
import OrgProfileRoute from './features/profiles/org/orgProfileRoute';
import FormRoute from './features/form/formRoute';

function App() {
  return (
    <div className="app">
      <AppHeader />

      <Switch>
        <Route
          path="/org/:orgId/users/new"
          exact
          component={CreateUserRoute}
        />
        <Route
          path="/org/:orgId/orgs/new"
          exact
          component={CreateOrgRoute}
        />
        <Route
          path="/user/:id"
          component={UserProfileRoute}
        />
        <Route
          path="/org/:id"
          component={OrgProfileRoute}
        />
        <Route
          path="/form"
          component={FormRoute}
        />
      </Switch>
    </div>
  );
}

const WithRouter = withRouter(App);
export default WithRouter;
