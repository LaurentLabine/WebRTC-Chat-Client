require('dotenv').config();
const express = require('express');
const http = require('http')
const socketIO = require('socket.io');

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

const io = socketIO(server)

const calls = {};

io.on('connection', socketIO => {

  // Take the passed ID from the browser
  socketIO.on('initiateCall', callID =>{
    console.log('initiateCall')

    // If the call already exists
    if(calls[callID]){
      // If the user is attempting to enter a call he's already registered in, do nothing.
      if(calls[callID].indexOf(socketIO.id) >= 0){
        // Otherwise, Second User just joined the call.  Add the user and emit 
      } else {

        calls[callID].push(socketIO.id)
        console.log('Server - ' + socketIO.id + ' Joined')
        // console.log(typeof(socketIO.id))
        // socketIO.emit('other user joined', socketIO.id)
        io.to(calls[callID][0]).emit('other user joined', {caller: calls[callID][0], target:socketIO.id})
      }

      // Otherwise we register the call
    } else {
      //Otherwise create and register it with the unique socket id
      calls[callID] = [socketIO.id]
      console.log('Server - Call Created')
      socketIO.emit('call created')
    }

    // // check if you are currently user a joining or user b
    // const otherUser = calls[callID].find(id => id !== socketIO.id);
    // if (otherUser) {
    //   // if the other user exists in the room..
    //   // (user b) emit a 'current' back up to ourselves with the other users socket id
    //   socketIO.emit('other user', otherUser);
    //   // emit the other users socket.id
    //   socketIO.to(otherUser).emit('user joined', socketIO.id);
    //   // you can see how this plays out more on the front end.
    // }

    console.log(calls)

      // when offer gets fired
    socketIO.on('Created Offer', payload => {
      console.log('Server - Received Offer from ' + payload.caller + 'to be shared with : ' + payload.target)
      io.to(payload.target).emit('ReceivedOffer', payload);
  });

  // the payload contains who we are as a user and the 'offer' object.

  // listen for the answer event
  socketIO.on('answer', payload => {
    console.log('received answer')
    io.to(payload.caller).emit('ReceivedAnswer', payload);
  });

   // each peer will come up with an 'ice server'
   socketIO.on('ice-candidate', incoming => {
     console.log('received ice-candidate')
    io.to(incoming.target).emit('ice-candidate', incoming.candidate);
  });

  // Now, let us create a 'handshake.'

  // when offer gets fired
  socketIO.on('offer', payload => {
    io.to(payload.target).emit('offer', payload);
  });

  // the payload contains who we are as a user and the 'offer' object.

  // listen for the answer event
  socketIO.on('answer', payload => {
    io.to(payload.target).emit('answer', payload);
  });

  socketIO.on('ice-candidate', incoming => {
    io.to(incoming.target).emit('ice-candidate', incoming.candidate);
  });


  })
})

server.listen(port, () => {
  console.log('Signaling server running on port ' + port);
})
