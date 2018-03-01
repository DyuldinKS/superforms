import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import getSubpath from 'shared/router/utils/getSubpath';
import Page, { PageHeader, PageNav, PageContent } from 'shared/ui/page';
import { Switch, Route } from 'shared/router/components';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import {
  OrgProfileHeader,
  OrgProfileInfo,
  OrgProfileNav,
  OrgProfileOrgsList,
  OrgProfileSettings,
  OrgProfileUsersList,
} from './components';

const propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  // from Redux
  id: PropTypes.string.isRequired,
  org: PropTypes.object,
  parentOrg: PropTypes.object,
  fetchOrg: PropTypes.func.isRequired,
};

const defaultProps = {
  org: {},
  parentOrg: {},
};

class OrgProfilePage extends Component {
  componentDidMount() {
    const { id, fetchOrg } = this.props;
    fetchOrg(id);
  }

  render() {
    const {
      match,
      location,
      org,
      parentOrg,
    } = this.props;

    const { url, path } = match;
    const subpath = getSubpath(location.pathname, url);

    return (
      <Page>
        <div className="app-profile-header-outer">
          <div className="container">
            <OrgProfileHeader
              org={org}
              parentOrg={parentOrg}
            />

            <OrgProfileNav
              baseUrl={url}
              subpath={subpath}
            />
          </div>
        </div>

        <PageContent className="container app-profile-content">
          <Switch>
            <Route
              path={`${path}/orgs`}
              exact
              component={OrgProfileOrgsList}
            />
            <Route
              path={`${path}/users`}
              exact
              component={OrgProfileUsersList}
            />
            <Route
              path={`${path}/settings`}
              exact
              component={OrgProfileSettings}
            />
            <Route
              path={path}
              component={OrgProfileInfo}
            />
          </Switch>
        </PageContent>
      </Page>
    );
  }
}

OrgProfilePage.propTypes = propTypes;
OrgProfilePage.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const orgId = ownProps.match.params.id;
  const org = orgsModule.selectors.getOrg(state, orgId);
  const parent = orgsModule.selectors.getOrg(state, org.entity.chiefOrgId);

  return {
    id: orgId,
    org: org.entity,
    parentOrg: parent.entity,
  };
}

const mapDispatchToProps = {
  fetchOrg: orgsModule.actions.fetchOne,
};

export default connect(mapStateToProps, mapDispatchToProps)(OrgProfilePage);
