import http from 'http';
import * as path from 'path';
import express from 'express';
import {Server} from 'colyseus';
import {monitor} from '@colyseus/monitor';
import HoldemRoom from './HoldemRoom';

const port = process.env.PORT || 9075;
const app = express();

app.use('/static', express.static(path.join(__dirname, '/../web/dist')));
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({server});
console.log('Defining room lobby');
gameServer.define('lobby', HoldemRoom);
console.log('done');

app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/../web/dist', 'index.html'));
});

app.use('/colyseus', monitor());
gameServer.listen(port);
console.log(`Server listening on ws://localhost:${port}.`);
