const socket = io();

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Global State
const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;
let webcamRunning = false;

// HTML elements
const webcamButton = document.getElementById('webcamButton');
const localVideo = document.getElementById('localVideo');
const callButton = document.getElementById('callButton');
const callIDInput = document.getElementById('callIDInput');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
const peerConnection = new RTCPeerConnection(configuration);

console.log(peerConnection)

// Taken from https://webrtc.org/getting-started/peer-connections
async function makeCall() {

  // If no ID is provided, a new one is generated
  const callID = callIDInput.value === '' ? makeId() : callIDInput.value

  // Initiate a call passing along the ID.
  socket.emit('initiateCall', callID)
}

// Once the RTCPeerConnection is created we need to create an SDP offer or answer, 
// depending on if we are the calling peer or receiving peer. Once the SDP offer or 
// answer is created, it must be sent to the remote peer through a different channel. 
// Passing SDP objects to remote peers is called signaling and is not covered by the WebRTC specification.


//When call is created we do nothing.  Wait for other user to connect to create the offer and send it over.
// socket.on('call created', async (callID) => {
//   console.log('Client - Call Created - Creating Offer')
//   const offer = await peerConnection.createOffer();
//   await peerConnection.setLocalDescription(offer);
//   socket.emit('new offer', {'callID': callID, 'offer': offer});
// })

socket.on('other user joined', async (payload) => {
  console.log('Client - Other User Joined' + JSON.stringify(payload))
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log(peerConnection)
  socket.emit('Created Offer', {caller: payload.caller, target: payload.target, offer : offer});
})

socket.on('ReceivedOffer', async (payload) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
  // console.log('Received offer ' + JSON.stringify(peerConnection.connectionState))
  // console.log(peerConn)
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  console.log('Done')
  console.log(peerConnection)
  // console.log('Received offer ' + JSON.stringify(peerConnection.connectionState))
  // console.log({caller: payload.caller, target: payload.target, offer : payload.offer, answer: answer}) // Here everything is known
  socket.emit('answer', {caller: payload.caller, target: payload.target, offer : payload.offer, answer: answer});
})

socket.on('ReceivedAnswer', async (payload) => {
  console.log('Done')
  // console.log('Received offer ' + JSON.stringify(peerConnection.connectionState))
  console.log(peerConnection)
  //  Here everything is known
})


// Listen for local ICE candidates on the local RTCPeerConnection
peerConnection.addEventListener('icecandidate', event => {
  if (event.candidate) {
      signalingChannel.send({'new-ice-candidate': event.candidate});
  }
});

// // Listen for remote ICE candidates and add them to the local RTCPeerConnection
// socket.on('','message', async message => {
//   console.log('Remote ICE Event')
//   if (message.iceCandidate) {
//       try {
//           await peerConnection.addIceCandidate(message.iceCandidate);
//       } catch (e) {
//           console.error('Error adding received ice candidate', e);
//       }
//   }
// });


// socket.on('offer', async message => {
//   const offer = await peerConnection.createOffer();
//   await peerConnection.setLocalDescription(offer);
//   socket.emit({'offer': offer});
// });

// socket.on('Answer', async message => {
//   if (message.answer) {
//       const remoteDesc = new RTCSessionDescription(message.answer);
//       await peerConnection.setRemoteDescription(remoteDesc);
//   }
// });

// 1. Setup media sources

webcamButton.onclick = async () => {
  if(localStream){
    localStream.getTracks().forEach(track => track.stop())
    localStream = null
    localVideo.srcObject = null
  }
  else{

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    // audio: true,
  });

  remoteStream = new MediaStream();

  // Push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Pull tracks from remote stream, add to video stream
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  localVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;

  webcamRunning = !webcamRunning;
  // callButton.disabled = !callButton.disabled;
}

  // callButton.disabled = false;
  // answerButton.disabled = false;
  // webcamButton.disabled = true;
};

callButton.onclick = async () => {
  makeCall()
  // console.log('Call Button Clicked')
  // socket.emit('EstablishCall')
}

// Random ID Generation.
// Taken from https://medium.com/@weberzt/how-to-create-a-random-id-in-javascript-e92b39fedaef
const makeId = () => {
  let ID = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for ( var i = 0; i < 12; i++ ) {
    ID += characters.charAt(Math.floor(Math.random() * 36));
  }
  return ID;
}
