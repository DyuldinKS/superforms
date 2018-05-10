import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Nav, NavItem, NavLink } from 'reactstrap';
import
  statusTabs,
  { defaultTab as defaultStatusTab } from '../utils/statusTabs';
import
  scopeTabs,
  { defaultTab as defaultScopeTab } from '../utils/scopeTabs';

const propTypes = {
  statusFilter: PropTypes.string,
  scope: PropTypes.string,
  onStatusFilterChange: PropTypes.func.isRequired,
  onScopeChange: PropTypes.func.isRequired,
};

const defaultProps = {
  statusFilter: defaultStatusTab,
  scope: defaultScopeTab,
};

class ProfleFormsNav extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      statusFilter,
      scope,
      onStatusFilterChange,
      onScopeChange,
    } = this.props;

    return (
      <Nav vertical pills className="profile-forms-nav">
        <div className="profile-forms-nav-header bg-light">
          Статус:
        </div>

        {
          statusTabs.map(item => (
            <NavItem key={item.tab}>
              <NavLink
                active={statusFilter === item.tab}
                href="#"
                onClick={() => onStatusFilterChange(item)}
              >
                {item.label}
              </NavLink>
            </NavItem>
          ))
        }

        <div className="profile-forms-nav-header bg-light">
          Принадлежность:
        </div>

        {
          scopeTabs.map(item => (
            <NavItem key={item.tab}>
              <NavLink
                active={scope === item.tab}
                href="#"
                onClick={() => onScopeChange(item.tab)}
              >
                {item.label}
              </NavLink>
            </NavItem>
          ))
        }
      </Nav>
    );
  }
}

ProfleFormsNav.propTypes = propTypes;
ProfleFormsNav.defaultProps = defaultProps;

export default ProfleFormsNav;
