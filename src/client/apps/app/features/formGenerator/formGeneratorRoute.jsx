import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SideBar from './components/SideBar';
import WorkingPane from './components/WorkingPaneContainer';

const propTypes = {};

const defaultProps = {};

function FormGeneratorRoute() {
  return (
    <DragDropContextProvider backend={HTML5Backend}>
      <div className="form-generator">
        <WorkingPane />
        <SideBar />
      </div>
    </DragDropContextProvider>
  );
}

FormGeneratorRoute.propTypes = propTypes;
FormGeneratorRoute.defaultProps = defaultProps;

export default FormGeneratorRoute;
