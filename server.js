require('dotenv').config();
const express = require('express');
const http = require('http')
const  startSignalingServer = require('./public/src/util/signalingServer')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => {
  console.log('Reached Main Route')
  res.sendFile(process.cwd() + '/views/index.html');
})

const server = http.createServer(app)
const port = process.env.PORT || 3000;

startSignalingServer(server)

server.listen(port, () => {
  console.log('Signaling server running on port ' + port);
})
