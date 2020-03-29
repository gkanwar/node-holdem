import * as Colyseus from 'colyseus.js';

export makeClient(server, port) {
  const client = new Colyseus.Client(`ws://${server}:${port}`);
  client.join('lobby').then(room => {
    console.log(`${room.sessionId} joined ${room.name}`);
    room.onStateChange((state) => {
      console.log(`${room.name} has new state: ${state}`);
    });
    room.onMessage((message) => {
      console.log(`${client.id} received on ${room.name}: ${message}`);
    });
  }).catch(e => {
    console.log(`Join error: ${e}`);
  });
}
