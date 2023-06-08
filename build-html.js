const { join } = require('path');
const fs = require('fs');

// CommonJS
const { Edge } = require('edge.js');

// Typescript import
// import { Edge } from 'edge.js'

console.log('Building...');

const edge = new Edge({ cache: false });
edge.mount(join(__dirname, 'views'));

edge
  .render('index', {
    greeting: 'Hello world',
  })
  .then((html) => {
    fs.writeFileSync('./index.html', html);
    console.log('Done');
  });
