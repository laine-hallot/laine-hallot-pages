const exampleSocket = new WebSocket(
  'ws://' + document.location.hostname + ':3000',
);

exampleSocket.onmessage = (event) => {
  console.log(event.data);
  if(event.data === 'NEEDS_REFRESH') {
    location.reload();
  }
};
