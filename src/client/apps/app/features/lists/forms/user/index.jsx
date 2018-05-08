import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Card, CardHeader } from 'reactstrap';
import { EntriesList } from 'shared/ui/list';
import { InputSearch } from 'shared/ui/inputs';
import * as sessionModule from 'apps/app/shared/redux/session';
import * as usersModule from 'apps/app/shared/redux/users';
import BaseComponent, {
  propTypes as basePropTypes,
  defaultProps as baseDefaultProps,
} from '../shared/components/FormsListContainer';
import CreateFormModal from './components/CreateFormModal';
import {
  Header,
  Item,
} from './components';

const propTypes = {
  userId: PropTypes.string.isRequired,
  ...basePropTypes,
};

const defaultProps = {
  ...baseDefaultProps,
};

class UserFormsListContainer extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = { showCreateModal: false };

    this.hideCreateModal = this.hideCreateModal.bind(this);
    this.showCreateModal = this.showCreateModal.bind(this);
  }

  hideCreateModal() {
    this.setState(() => ({ showCreateModal: false }));
  }

  showCreateModal() {
    this.setState(() => ({ showCreateModal: true }));
  }

  renderCreateLink() {
    const { isSessionUser } = this.props;
    if (!isSessionUser) return null;

    return (
      <Button
        color="primary"
        className="forms-list-btn-add"
        onClick={this.showCreateModal}
      >
        Создать форму
      </Button>
    );
  }

  renderCreateModal() {
    return (
      <CreateFormModal
        closeModal={this.hideCreateModal}
      />
    );
  }

  render() {
    const { entries } = this.props;

    return (
      <Card className="forms-list-container">
        {
          this.state.showCreateModal
            ? this.renderCreateModal()
            : null
        }

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

export default connect(mapStateToProps, null)(UserFormsListContainer);
