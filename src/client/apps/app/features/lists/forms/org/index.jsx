import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card, CardHeader } from 'reactstrap';
import { EntriesList } from 'shared/ui/list';
import { InputSearch } from 'shared/ui/inputs';
import { Link } from 'shared/router/components';
import * as orgsModule from 'apps/app/shared/redux/orgs';
import BaseComponent, {
  propTypes as basePropTypes,
  defaultProps as baseDefaultProps,
} from '../shared/components/FormsListContainer';
import {
  Header,
  Item,
} from './components';

const propTypes = {
  orgId: PropTypes.string.isRequired,
  ...basePropTypes,
};

const defaultProps = {
  ...baseDefaultProps,
};

class OrgFormsListContainer extends BaseComponent {
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

OrgFormsListContainer.propTypes = propTypes;
OrgFormsListContainer.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  const { orgId } = ownProps;
  const {
    entries,
    search,
    filters,
  } = orgsModule.selectors.getFormsList(state, orgId);

  return {
    entries,
    search,
    filters,
  };
}

export default connect(mapStateToProps, null)(OrgFormsListContainer);
