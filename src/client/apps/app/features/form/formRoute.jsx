import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as formsModule from 'apps/app/shared/redux/forms';
import { Switch, Route } from 'shared/router/components';
import getSubpath from 'shared/router/utils/getSubpath';
import FormNav from './components/FormNav';
import FormGenerator from './generator/generatorRoute';
import FormPreview from './preview/previewRoute';
import DistributionRoute from './distribution/distributionRoute';

const propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  // from Redux
  id: PropTypes.string.isRequired,
  isLoaded: PropTypes.bool,
  fetchForm: PropTypes.func.isRequired,
};

const defaultProps = {
  isLoaded: false,
};

class FormRoute extends Component {
  componentDidMount() {
    const { id, fetchForm } = this.props;
    fetchForm(id);
  }

  renderSpinner() {
    return (
      <div>Загрузка...</div>
    );
  }

  renderTabContent() {
    const { match } = this.props;
    const { path } = match;

    return (
      <Switch>
        <Route
          path={`${path}/preview`}
          exact
          component={FormPreview}
        />
        <Route
          path={`${path}/distribute`}
          component={DistributionRoute}
        />
        <Route
          path={`${path}`}
          component={FormGenerator}
        />
      </Switch>
    );
  }

  render() {
    const { match, location, isLoaded } = this.props;
    const subpath = getSubpath(location.pathname, match.url);

    return (
      <div className="app-form-generator">
        <FormNav
          subpath={subpath}
          baseUrl={match.url}
        />

        {
          isLoaded
          ? this.renderTabContent()
          : this.renderSpinner()
        }
      </div>
    );
  }
}

FormRoute.propTypes = propTypes;
FormRoute.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const formId = ownProps.match.params.id;
  const { entity, fetchStatus } = formsModule.selectors.getForm(state, formId);
  const { scheme } = entity;

  return {
    id: formId,
    isLoaded: fetchStatus === 'loaded' && !!scheme,
  };
}

const mapDispatchToProps = {
  fetchForm: formsModule.actions.fetch,
};

export default connect(mapStateToProps, mapDispatchToProps)(FormRoute);
