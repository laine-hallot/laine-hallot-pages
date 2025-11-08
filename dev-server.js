import express from 'express';
import { join } from 'path';
import fs from 'fs';

import WebSocket, { WebSocketServer } from 'ws';

import { startFileWatcher } from './util/file-watcher.js';
import {
  buildHtml,
  buildCss,
  buildAssets,
  buildJS,
} from './util/build-tools.js';
import { run as runInitialBuild } from './build.js';

let app = express();
const port = 3000;

console.log('Adding Dev Webhooks');
fs.promises
  .cp('./util/update-watcher-client.js', './_site/update-watcher-client.js', {
    force: true,
  })
  .then(() => {
    /*no op*/
  });
console.log('Done');

app.use(express.static('_site'));
/* 
app.get('/', (req, res) => {
  res.send(html);
}); */

// Create Websocket
const wsServer = new WebSocketServer({ noServer: true });
// Configure websocket events
wsServer.on('connection', (ws) => {
  console.log('client connected');
  ws.on('error', console.error);
  ws.on('message', (data, isBinary) => {
    console.log('message received from client');
    console.log(String(data));
    wsServer.clients.forEach((client) => {
      console.log(client.url);
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        console.log('Sending message to client');
        client.send(data, { binary: isBinary });
      }
    });
  });
});

const wrapWithWebSocket = (server) => {
  server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (ws) => {
      wsServer.emit('connection', ws, request);
    });
  });
};

const createExpressServer = () => {
  const server = app.listen(port, () => {
    console.log(`Server up at: http://localhost:${port}`);
  });
  return server;
};

const sendRefreshNotification = () => {
  wsServer.clients.forEach((client) => {
    client.send('NEEDS_REFRESH');
  });
};

const handleFileUpdate = async (matchedFileType) => {
  switch (matchedFileType) {
    case 'js':
      console.log('JS change');
      await buildJS();
      sendRefreshNotification();
      break;
    case 'html':
      console.log('HTML change');
      await buildHtml();
      sendRefreshNotification();
      break;
    case 'css':
      console.log('CSS change');
      buildCss();
      sendRefreshNotification();
      break;
    case 'assets':
      console.log('Asset change');
      await buildAssets();
      sendRefreshNotification();
      break;
  }
};

const run = async () => {
  await runInitialBuild();
  console.log('All build steps finished.');
  console.log('Starting server');
  wrapWithWebSocket(createExpressServer());
  console.log('Starting file watcher');
  startFileWatcher(handleFileUpdate);
};

run();
