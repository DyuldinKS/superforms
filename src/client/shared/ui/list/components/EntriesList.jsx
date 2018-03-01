import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  entries: PropTypes.arrayOf(PropTypes.string),
  EntryComponent: PropTypes.func.isRequired,
};

const defaultProps = {
  entries: [],
};

function EntriesList(props) {
  const {
    entries,
    EntryComponent,
  } = props;

  return (
    <ul className="entries-list">
      {
        entries.map(entryId => (
          <li key={entryId} className="entries-list-item">
            <EntryComponent id={entryId} />
          </li>
        ))
      }
    </ul>
  );
}

EntriesList.propTypes = propTypes;
EntriesList.defaultProps = defaultProps;

export default EntriesList;
