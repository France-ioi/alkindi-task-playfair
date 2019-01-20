
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {link, include} from 'epic-linker';

import './shim';
import HostBundle from './host';

export function hostTask (options, TaskBundle) {

  // Link the Host and Task bundles.
  const {store, scope, start} = link(function* (deps) {
    yield include(HostBundle);
    yield include(TaskBundle);
  });

  // Initialize the store.
  store.dispatch({type: scope.init});

  // Start the sagas.
  start();

  // Dispatch the start-up actions.
  if (options.task) {
    store.dispatch({type: scope.taskLoaded,
      task: options.task, full_task: options.full_task});
  }
  if (options.view) {
    store.dispatch({type: scope.viewSelected, view: options.view});
  }
  if (options.score) {
    store.dispatch({type: scope.scoreChanged, score: options.score});
  }

  // Render the application in the container.
  if (options.container) {
    const WrappedApp = DragDropContext(HTML5Backend)(scope.App);
    ReactDOM.render(<Provider store={store}><WrappedApp/></Provider>, options.container);
  }

  return {store, scope};

};
