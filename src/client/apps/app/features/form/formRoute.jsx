import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as formsModule from 'apps/app/shared/redux/forms';
import Header from './components/Header';
import FormGenerator from './generator/generatorRoute';
import FormPreview from './preview/previewRoute';

const propTypes = {
  // from Redux
  id: PropTypes.string.isRequired,
  isLoaded: PropTypes.bool,
  fetchForm: PropTypes.func.isRequired,
};

const defaultProps = {
  isLoaded: false,
};

const initialState = {
  activeTab: 'generator',
};

class FormRoute extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.changeTab = this.changeTab.bind(this);
  }

  componentDidMount() {
    const { id, fetchForm } = this.props;
    fetchForm(id);
  }

  changeTab(activeTab) {
    this.setState(state => ({
      ...state,
      activeTab,
    }));
  }

  renderSpinner() {
    return (
      <div>Загрузка...</div>
    );
  }

  renderTabContent() {
    const { activeTab } = this.state;
    const { id } = this.props;

    if (activeTab === 'generator') {
      return (
        <FormGenerator id={id} />
      );
    }

    return (
      <FormPreview id={id} />
    );
  }

  render() {
    const { activeTab } = this.state;
    const { isLoaded } = this.props;

    return (
      <div className="app-form-generator">
        <Header
          activeTab={activeTab}
          onChange={this.changeTab}
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
