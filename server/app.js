import http from 'http';
import * as path from 'path';
import express from 'express';
import {Server} from 'colyseus';
import {monitor} from '@colyseus/monitor';
import HoldemRoom from './HoldemRoom';
import {version} from '../package.json';

const port = process.env.PORT || 9075;
const webPort = process.env.WEBPORT || 8080;
const app = express();
const webApp = express();

webApp.use('/static', express.static(path.join(__dirname, '/../web/dist')));
webApp.get('/info', (req, res) => {
  res.json({
    port: port,
    version: version
  });
});
webApp.use(express.json());
webApp.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/../web/dist', 'index.html'));
});
webApp.listen(webPort, () => {
  console.log(`Web client listening on http://localhost:${webPort}.`);
});

const server = http.createServer(app);
const gameServer = new Server({server});
gameServer.define('lobby', HoldemRoom);
app.use('/colyseus', monitor());
gameServer.listen(port);
console.log(`Server listening on ws://localhost:${port}.`);

