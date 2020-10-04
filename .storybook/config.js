import { addParameters, configure } from '@storybook/react';
import 'storybook-chromatic';
import grommetLight from './theme';

const req = require.context(
  '../src/',
  true,
  /\/stories\/.*\.ts$|\/stories\/.*\.tsx$/,
);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

addParameters({
  options: {
    theme: grommetLight,
    showNav: true,
    showPanel: false, // show the code panel by default
  },
});

configure(loadStories, module);
