import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Card, CardHeader } from 'reactstrap';
import { EntriesList } from 'shared/ui/list';
import { InputSearch } from 'shared/ui/inputs';
import * as sessionModule from 'apps/app/shared/redux/session';
import * as usersModule from 'apps/app/shared/redux/users';
import withCreateFormModal from 'apps/app/shared/components/withCreateFormModal';
import BaseComponent, {
  propTypes as basePropTypes,
  defaultProps as baseDefaultProps,
} from '../shared/components/FormsListContainer';
import {
  Header,
  Item,
} from './components';

const propTypes = {
  userId: PropTypes.string.isRequired,
  showCreateModal: PropTypes.func.isRequired,
  ...basePropTypes,
};

const defaultProps = {
  ...baseDefaultProps,
};

class UserFormsListContainer extends BaseComponent {
  renderCreateLink() {
    const { isSessionUser, showCreateModal } = this.props;
    if (!isSessionUser) return null;

    return (
      <Button
        color="primary"
        className="forms-list-btn-add"
        onClick={showCreateModal}
      >
        Создать форму
      </Button>
    );
  }

  render() {
    const { entries } = this.props;

    return (
      <Card className="forms-list-container">
        <CardHeader>
          <div className="forms-list-search">
            <InputSearch
              placeholder="Поиск среди форм"
              onChange={this.handleSearchDebounced}
            />
          </div>

          {this.renderCreateLink()}
        </CardHeader>

        <Header />
        <EntriesList
          entries={entries}
          EntryComponent={Item}
        />
      </Card>
    );
  }
}

UserFormsListContainer.propTypes = propTypes;
UserFormsListContainer.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { userId } = ownProps;
  const {
    entries,
    search,
    filters,
  } = usersModule.selectors.getFormsList(state, userId);
  const isSessionUser = sessionModule.selectors.isSessionUser(state, userId);

  return {
    entries,
    search,
    filters,
    isSessionUser,
  };
}

const WithCreateFormModal = withCreateFormModal(UserFormsListContainer);
export default connect(mapStateToProps, null)(WithCreateFormModal);
