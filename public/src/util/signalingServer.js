const socketIO = require('socket.io');
const calls = {};

const startSignalingServer = (httpServer) => {

  const io = socketIO(httpServer)
io.on('connection', socketIO => {

  // Take the passed ID from the browser
  socketIO.on('registercall', callID =>{

    // If the call already exists
    if(calls[callID]){
      // If the user is attempting to enter a call he's already registered in, do nothing.
      if(calls[callID].indexOf(socketIO.id) >= 0){
        // Otherwise, Second User just joined the call.  Add the user and emit a 'otheruserjoined'
      } else {
        calls[callID].push(socketIO.id)
        io.to(calls[callID][0]).emit('otheruserjoined', {caller: calls[callID][0], target:socketIO.id})
      }

      // Otherwise we register the call
    } else {
      //Otherwise create and register it with the unique socket id
      calls[callID] = [socketIO.id]
    }

      // when offer gets fired
    socketIO.on('offercreated', payload => {
      io.to(payload.target).emit('receivedoffer', payload);
  });

  // the payload contains who we are as a user and the 'offer' object.

  // listen for the answer event
  socketIO.on('answeremitted', payload => {
    io.to(payload.caller).emit('receivedanswer', payload);
  });

   // each peer will come up with an 'ice server'
   socketIO.on('newicecandidate', incoming => {

    //Determine which candidate to send this to
    if(calls[callID].indexOf(socketIO.id) === 0){
      io.to(calls[callID][1]).emit('remoteicecandidate', incoming);
    } else {
      io.to(calls[callID][0]).emit('remoteicecandidate', incoming);
    }
  });
  })

  socketIO.on('disconnect', socketIO => {
    console.log('user disconnected')
  })

})
}

module.exports = startSignalingServer;