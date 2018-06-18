import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Nav, NavItem } from 'reactstrap';
import classNames from 'classnames';
import { Link } from 'shared/router/components';

const propTypes = {
  baseUrl: PropTypes.string,
  subpath: PropTypes.string,
};

const defaultProps = {
  baseUrl: '',
  subpath: '/edit',
};

class FormNav extends Component {
  constructor(props) {
    super(props);
    this.defaultTab = '/edit';
  }

  getClassName(linkPath) {
    const { subpath } = this.props;

    return classNames(
      'nav-link',
      {
        active: subpath
          ? subpath.startsWith(linkPath)
          : linkPath === this.defaultTab,
      },
    );
  }

  render() {
    const { subpath, baseUrl } = this.props;

    return (
      <div className="form-generator-nav">
        <Nav tabs>
          <NavItem>
            <Link
              className={this.getClassName('/edit')}
              to={`${baseUrl}/edit`}
            >
              Генератор
            </Link>
          </NavItem>
          <NavItem>
            <Link
              className={this.getClassName('/preview')}
              to={`${baseUrl}/preview`}
            >
              Предпросмотр
            </Link>
          </NavItem>
          <NavItem>
            <Link
              className={this.getClassName('/distribute')}
              to={`${baseUrl}/distribute`}
            >
              Сбор ответов
            </Link>
          </NavItem>
          <NavItem>
            <Link
              className={this.getClassName('/responses')}
              to={`${baseUrl}/responses`}
            >
              Результаты
            </Link>
          </NavItem>
        </Nav>
      </div>
    );
  }
}

FormNav.propTypes = propTypes;
FormNav.defaultProps = defaultProps;

export default FormNav;