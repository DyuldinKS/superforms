/**
 * Displays settings for organisation profile
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Nav,
  NavItem,
  Button,
} from 'reactstrap';
import { AccordionItem } from 'shared/ui/accordion';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import { ChangeEmail } from '../../shared/components/forms';
import { ChangeOrgInfo } from './forms';

const propTypes = {
  // from Redux
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  email: PropTypes.string.isRequired,
  changeInfo: PropTypes.func,
  changeEmail: PropTypes.func,
  changeStatus: PropTypes.func,
};

const defaultProps = {
  changeInfo: () => {},
  changeEmail: () => {},
  changeStatus: () => {},
};

class OrgSettings extends Component {
  constructor(props) {
    super(props);

    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleActiveChange = this.handleActiveChange.bind(this);
  }

  handleActiveChange() {
    const { active, changeStatus, id } = this.props;
    changeStatus(id, !active);
  }

  handleInfoChange(form) {
    const { id, changeInfo } = this.props;
    changeInfo(id, form);
  }

  handleEmailChange(form) {
    const { id, changeEmail } = this.props;
    changeEmail(id, form.email);
  }

  renderChangeActiveToggle() {
    const { active } = this.props;
    return active ?
      'Заблокировать доступ в систему' :
      'Открыть доступ в систему';
  }

  render() {
    const {
      email,
      fullName,
      label,
    } = this.props;

    return (
      <div>
        <Nav vertical>
          <NavItem>
            <Button
              color="link"
              onClick={this.handleActiveChange}
            >
              {this.renderChangeActiveToggle()}
            </Button>
          </NavItem>

          <AccordionItem
            label="Изменить основную информацию"
          >
            <ChangeOrgInfo
              fullName={fullName}
              label={label}
              onSubmit={this.handleInfoChange}
            />
          </AccordionItem>

          <AccordionItem
            label="Изменить адрес электронной почты"
          >
            <ChangeEmail
              email={email}
              onSubmit={this.handleEmailChange}
            />
          </AccordionItem>
        </Nav>
      </div>
    );
  }
}

OrgSettings.propTypes = propTypes;
OrgSettings.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const orgId = ownProps.match.params.id;
  const org = orgsModule.selectors.getOrg(state, orgId);
  const {
    active,
    email,
    fullName,
    label,
  } = org.entity;

  return {
    id: orgId,
    active,
    email,
    fullName,
    label,
  };
}

const mapDispatchToProps = {
  changeStatus: orgsModule.actions.changeStatus,
  changeEmail: orgsModule.actions.changeEmail,
  changeInfo: orgsModule.actions.changeInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(OrgSettings);
