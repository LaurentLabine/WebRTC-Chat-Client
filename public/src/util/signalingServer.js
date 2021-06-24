const socketIO = require('socket.io');
const calls = {};

const startSignalingServer = (httpServer) => {

  const io = socketIO(httpServer)
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
        io.to(calls[callID][0]).emit('OtherJoined', {caller: calls[callID][0], target:socketIO.id})
      }

      // Otherwise we register the call
    } else {
      //Otherwise create and register it with the unique socket id
      calls[callID] = [socketIO.id]
      console.log('Server - Call Created')
    }
    console.log(calls)

      // when offer gets fired
    socketIO.on('OfferCreated', payload => {
      io.to(payload.target).emit('ReceivedOffer', payload);
  });

  // the payload contains who we are as a user and the 'offer' object.

  // listen for the answer event
  socketIO.on('answer', payload => {
    console.log('received answer')
    io.to(payload.caller).emit('ReceivedAnswer', payload);
  });

   // each peer will come up with an 'ice server'
   socketIO.on('new-ice-candidate', incoming => {

    //Determine which candidate to send this to
    if(calls[callID].indexOf(socketIO.id) === 0){
      io.to(calls[callID][1]).emit('remote-ice-candidate', incoming);
    } else {
      io.to(calls[callID][0]).emit('remote-ice-candidate', incoming);
    }
  });
  })
})
}

module.exports = startSignalingServer;