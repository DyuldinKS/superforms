import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import Moment from 'moment';
import { Link } from 'shared/router/components';
import OwnerCredentials from './OwnerCredentials';
import { constants as statuses } from '../utils/statusTabs';
import { constants as scopes } from '../utils/scopeTabs';

const propTypes = {
  statusFilter: PropTypes.string,
  scope: PropTypes.string,
  item: PropTypes.object.isRequired,
};

const defaultProps = {};

class FormItem extends Component {
  constructor(props) {
    super(props);
  }

  renderOptionalCols() {
    const { statusFilter, item } = this.props;

    switch (statusFilter) {
      case statuses.ACTIVE: {
        const expires = (item.collecting && item.collecting.expires)
          ? Moment(item.collecting.expires).format('Do MMMM YYYY')
          : '-';

        return (
          <React.Fragment>
            <div className="profile-forms-item-col col3">
              {expires}
            </div>
            <div className="profile-forms-item-col col4">
              {item.responseCount || 0}
            </div>
          </React.Fragment>
        );
      }

      case statuses.ALL:
        return (
          <React.Fragment>
            <div className="profile-forms-item-col col3">
              {
                !item.collecting
                  ? 'В разработке'
                  : item.collecting.inactive
                    ? 'Завершена'
                    : 'Активна'
              }
            </div>
            <div className="profile-forms-item-col col4">
              {
                item.collecting
                  ? item.responseCount || 0
                  : '-'
              }
            </div>
          </React.Fragment>
        );

      case statuses.INACTIVE:
        return (
          <React.Fragment>
            <div className="profile-forms-item-col col4">
              {item.responseCount || 0}
            </div>
          </React.Fragment>
        );

      default:
        return (
          <React.Fragment>
            <div className="profile-forms-item-col col4">
              {Moment(item.created).format('Do MMMM YYYY')}
            </div>
          </React.Fragment>
        );
    }
  }

  renderDropdownButton() {
    return (
      <div className="profile-forms-item-col col5">
        <UncontrolledDropdown>
          <DropdownToggle caret size="sm" color="link" />
          <DropdownMenu right>
            <DropdownItem>Создать дубликат</DropdownItem>
            <DropdownItem>Удалить</DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    );
  }

  renderCredentials() {
    const { ownerId } = this.props.item;

    return (
      <div className="profile-forms-item-credentials">
        <small>Автор: <OwnerCredentials id={ownerId} /></small>
      </div>
    );
  }

  render() {
    const { item, scope } = this.props;
    const { id, title } = item;

    return (
      <Card body className="profile-forms-item">
        <div className="profile-forms-item-row">
          <div className="profile-forms-item-col col1">{id}</div>
          <div className="profile-forms-item-col col2" title={title}>
            <Link to={`/form/${id}`}>
              {title}
            </Link>
          </div>
          {this.renderOptionalCols()}
          {this.renderDropdownButton()}
        </div>

        {
          scope === scopes.ORG
          ? this.renderCredentials()
          : null
        }
      </Card>
    );
  }
}

FormItem.propTypes = propTypes;
FormItem.defaultProps = defaultProps;

export default FormItem;
