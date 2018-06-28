import React from 'react';
import PropTypes from 'prop-types';
import CollectionSample from './CollectionSample';
import * as inputTypes from 'shared/form/utils/inputTypes';

const propTypes = {};

const defaultProps = {};

const samples = Object.values(inputTypes.constants);

function ItemsCollection() {
  return (
    <div className="form-generator-side-bar">
      {
        samples.map(type => (
          <CollectionSample
            id={type}
            title={inputTypes.locales[type]}
            key={type}
          />
        ))
      }
    </div>
  );
}

ItemsCollection.propTypes = propTypes;
ItemsCollection.defaultProps = defaultProps;

export default ItemsCollection;
