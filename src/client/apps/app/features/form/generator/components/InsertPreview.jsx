import React from 'react';
import PropTypes from 'prop-types';
import { locales as inputTypeLocales} from 'shared/form/utils/inputTypes';
import { SAMPLE, BLOCK } from '../utils/dndTypes';
import CollectionSample from './CollectionSample';
import { InputItem as DumbInputItem } from './InputItem';

const propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf([BLOCK, SAMPLE]).isRequired,
};

const defaultProps = {};

const contextTypes = {
  findItem: PropTypes.func.isRequired,
  getItem: PropTypes.func.isRequired,
};

function InsertPreview(props, context) {
  const { id, type } = props;
  const { findItem, getItem } = context;

  if (type === SAMPLE) {
    return (
      <CollectionSample
        id={id}
        title={inputTypeLocales[id]}
        dragging
      />
    );
  }

  return (
    <DumbInputItem
      id={id}
      index={findItem(id) + 1}
      item={getItem(id)}
      dragging
    />
  );
}

InsertPreview.propTypes = propTypes;
InsertPreview.defaultProps = defaultProps;
InsertPreview.contextTypes = contextTypes;

export default InsertPreview;
