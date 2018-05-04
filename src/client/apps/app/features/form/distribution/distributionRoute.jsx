import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Moment from 'moment';
import {
  Alert,
  Button,
  Jumbotron,
} from 'reactstrap';
import * as formsModule from 'apps/app/shared/redux/forms';
import { constants, defaultTab } from './utils/tabs';
import Nav from './components/Nav';
import LinkTab from './components/LinkTab';
import SettingsTab from './components/SettingsTab';
import generateSecret from '../../../../../../server/libs/passwordGenerator';

const propTypes = {
  // from Redux
  collecting: PropTypes.object,
  collectUpdate: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  isCollecting: PropTypes.bool,
};

const defaultProps = {
  collecting: null,
  isCollecting: false,
};

class DistributionRoute extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: defaultTab,
    };

    this.startCollecting = this.startCollecting.bind(this);
    this.updateCollectSettings = this.updateCollectSettings.bind(this);
    this.changeTab = this.changeTab.bind(this);
  }

  startCollecting() {
    const { collectUpdate, id } = this.props;
    const shared = generateSecret(8, 8, ['numbers', 'lowercase']);
    collectUpdate(id, { shared });
    this.changeTab(constants.SETTINGS);
  }

  updateCollectSettings(updates) {
    const { collectUpdate, id } = this.props;
    collectUpdate(id, updates);
  }

  changeTab(nextTab) {
    this.setState((state) => {
      if (state.activeTab === nextTab) {
        return state;
      }

      return {
        ...state,
        activeTab: nextTab,
      };
    });
  }

  isInactive() {
    const { inactive, expires } = this.props.collecting;
    return inactive || Moment().isAfter(expires);
  }

  renderAlert() {
    const { inactive, expires } = this.props.collecting;
    let reason = '';

    if (inactive) {
      reason = 'В настройках формы был остановлен сбор ответов.';
    } else if (expires) {
      const date = Moment(expires).format('Do MMMM YYYY');
      reason = `Истек выставленный срок сбора ответов (до ${date}).`;
    }

    return (
      <Alert color="warning">
        Ответы на форму больше не принимаются<br />
        <small>
          {reason}
        </small>
      </Alert>
    );
  }

  renderStartScreen() {
    return (
      <Jumbotron className="form-distribution-start-screen">
        <h1 className="display-4">Сбор ответов еще не ведется</h1>
        <hr className="my-2" />
        <p>Начав сбор ответов, вы не сможете вносить изменения в структуру формы</p>
        <p className="lead">
          <Button
            color="primary"
            onClick={this.startCollecting}
          >
            Начать сбор ответов
          </Button>
        </p>
      </Jumbotron>
    );
  }

  renderTabContent() {
    const { collecting, id } = this.props;
    const { shared } = collecting;

    switch (this.state.activeTab) {
      case constants.LINK:
        return (
          <LinkTab
            id={id}
            shared={shared}
          />
        );

      case constants.SETTINGS:
        return (
          <SettingsTab
            id={id}
            collecting={collecting}
            onUpdate={this.updateCollectSettings}
          />
        );

      default:
        return null;
    }
  }

  render() {
    if (!this.props.isCollecting) {
      return this.renderStartScreen();
    }

    return (
      <div className="form-distribution container">
        <Nav active={this.state.activeTab} onChange={this.changeTab} />
        <div className="tab-content">
          {
            this.isInactive()
            ? this.renderAlert()
            : null
          }
          {this.renderTabContent()}
        </div>
      </div>
    );
  }
}

DistributionRoute.propTypes = propTypes;
DistributionRoute.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { id } = ownProps.match.params;
  const { collecting } = formsModule.selectors.getFormEntity(state, id);

  return {
    id,
    isCollecting: !!collecting,
    collecting,
  };
}

const mapDispatchToProps = {
  collectUpdate: formsModule.actions.collectUpdate,
};

export default connect(mapStateToProps, mapDispatchToProps)(DistributionRoute);
