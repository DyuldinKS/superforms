import React from 'react';
import PropTypes from 'prop-types';
import { Nav, NavItem, NavLink } from 'reactstrap';
import classNames from 'classnames';

const propTypes = {
  activeTab: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

const defaultProps = {
  activeTab: 'generator',
};

function Header(props) {
  const { activeTab, onChange } = props;

  return (
    <div className="form-generator-header">
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classNames({ active: activeTab === 'generator' })}
            onClick={() => onChange('generator')}
          >
            Генератор
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classNames({ active: activeTab === 'preview' })}
            onClick={() => onChange('preview')}
          >
            Предпросмотр
          </NavLink>
        </NavItem>
      </Nav>
    </div>
  );
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default Header;
