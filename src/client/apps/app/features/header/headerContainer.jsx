import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'shared/router/components';
import * as sessionModule from 'apps/app/shared/redux/session';
import HeaderNavigation from './components/HeaderNavigation';
import HeaderAccount from './components/HeaderAccount';

const propTypes = {
  orgId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
};

const defaultProps = {};

function AppHeader(props) {
  const { orgId, userId } = props;

  return (
    <div className="app-header-outer">
      <header className="container app-header">
        <a href="/">
          Super&nbsp;Forms
        </a>

        <HeaderNavigation orgId={orgId} />

        <HeaderAccount userId={userId} />
      </header>
    </div>
  );
}

AppHeader.propTypes = propTypes;
AppHeader.defaultProps = defaultProps;

function mapStateToProps(state) {
  const session = sessionModule.selectors.getStore(state);

  return {
    userId: session.userId,
    orgId: session.orgId,
  };
}

export default connect(mapStateToProps, null)(AppHeader);
