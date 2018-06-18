import React from 'react';
import PropTypes from 'prop-types';
import { Nav, NavItem, NavLink } from 'reactstrap';
import tabs, { defaultTab } from '../utils/tabs';

const propTypes = {
  active: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

const defaultProps = {
  active: defaultTab,
};

const settingsTab = tabs[tabs.length - 1];
const distributionMethods = tabs.slice(0, tabs.length - 1);

function FormDistributionNav(props) {
  const { active, onChange } = props;

  return (
    <Nav vertical pills>
      {
        distributionMethods.map(({ tab, label }) => (
          <NavItem>
            <NavLink
              active={active === tab}
              href="#"
              onClick={() => onChange(tab)}
            >
              {label}
            </NavLink>
          </NavItem>
        ))
      }

      <hr />

      <NavItem>
        <NavLink
          active={active === settingsTab.tab}
          href="#"
          onClick={() => onChange(settingsTab.tab)}
        >
          {settingsTab.label}
        </NavLink>
      </NavItem>
    </Nav>
  );
}

FormDistributionNav.propTypes = propTypes;
FormDistributionNav.defaultProps = defaultProps;

export default FormDistributionNav;
