const socket = io();

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
const peerConnection = new RTCPeerConnection(configuration);
let remoteStream = new MediaStream();

export const initiateCall = (callID) => {
  socket.emit('initiateCall', callID)
}

export const initializePeerConnection = () => {

peerConnection.addEventListener('addstream', event => {
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
});

peerConnection.addEventListener('connectionstatechange', event => {
  if (peerConnection.connectionState === 'connected') {
      console.log('Connected')
  }
});

// Listen for connectionstatechange on the local RTCPeerConnection
peerConnection.addEventListener('connectionstatechange', event => {
  if (peerConnection.connectionState === 'connected') {
      console.log('Connected')
  }
});

// Listen for local ICE candidates on the local RTCPeerConnection
peerConnection.addEventListener('icecandidate', event => {
  if (event.candidate) {
    socket.emit('new-ice-candidate', event.candidate);
  }
});

//Handshake Logic

socket.on('remote-ice-candidate', async (candidate) => {
  try {
      await peerConnection.addIceCandidate(candidate);
  } catch (e) {
      console.error('Error adding received ice candidate', e);
  }
})

// Created offer and set it as local description for caller.
socket.on('OtherJoined', async (payload) => {

const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

socket.emit('OfferCreated', {caller: payload.caller, target: payload.target, offer : offer});
})

// Offer Received by Server.  Setting it as remote session description
socket.on('ReceivedOffer', async (payload) => {

peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
const answer = await peerConnection.createAnswer();
await peerConnection.setLocalDescription(answer);

socket.emit('answer', {caller: payload.caller, target: payload.target, offer : payload.offer, answer: answer});
})

// Call Initiator receives the answer and sets remote SDP
socket.on('ReceivedAnswer', async (payload) => {
await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
})

return peerConnection
}


