/**
 * Displays settings for organisation profile
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Nav,
  NavItem,
  NavLink,
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
  status: PropTypes.string.isRequired,
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

    this.defaultState = {
      expanded: null,
    };

    this.state = this.defaultState;

    this.handleInfoChange = this.handleInfoChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  handleStatusChange() {
    const { status, changeStatus, id } = this.props;

    if (status === 'blocked') {
      changeStatus(id, 'active');
    } else {
      changeStatus(id, 'blocked');
    }
  }

  handleInfoChange(form) {
    const { id, changeInfo } = this.props;
    changeInfo(id, form);
  }

  handleEmailChange(form) {
    const { id, changeEmail } = this.props;
    changeEmail(id, form.email);
  }

  renderChangeStatusToggle() {
    const { status } = this.props;
    return status === 'active' ?
      'Заблокировать доступ в систему' :
      'Открыть доступ в систему';
  }

  render() {
    const {
      email,
      fullName,
      label,
    } = this.props;
    const { expanded } = this.state;

    return (
      <div>
        <Nav vertical>
          <NavItem>
            <NavLink
              href="javascript:;"
              onClick={this.handleStatusChange}
            >
              {this.renderChangeStatusToggle()}
            </NavLink>
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
    status,
    email,
    fullName,
    label,
  } = org.entity;

  return {
    id: orgId,
    status,
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
