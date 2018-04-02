import React from 'react';
import PropTypes from 'prop-types';
import FormItemSample from './FormItemSample';
import { samples, getSample } from '../utils/samples';

const propTypes = {};

const defaultProps = {};

function SideBar(props) {
  return (
    <div className="form-generator-side-bar">
      {
        samples.map(sampleId => (
          <FormItemSample
            id={sampleId}
            item={getSample(sampleId)}
            key={sampleId}
          />
        ))
      }
    </div>
  );
}

SideBar.propTypes = propTypes;
SideBar.defaultProps = defaultProps;

export default SideBar;
