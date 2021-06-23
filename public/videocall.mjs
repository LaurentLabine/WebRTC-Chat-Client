const socket = io();

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
const debugButton = document.getElementById('debugButton')

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
const peerConnection = new RTCPeerConnection(configuration);

peerConnection.onaddstream = handleRemoteStreamAdded;

function handleRemoteStreamAdded(event) {
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
}

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

socket.on('remote-ice-candidate', async (candidate) => {
    try {
        await peerConnection.addIceCandidate(candidate);
    } catch (e) {
        console.error('Error adding received ice candidate', e);
    }
})

debugButton.addEventListener('click', () => {
  console.log(peerConnection)
})

// Taken from https://webrtc.org/getting-started/peer-connections
async function makeCall() {

  // If no ID is provided, a new one is generated
  const callID = callIDInput.value === '' ? makeId() : callIDInput.value

  callIDInput.value = callID;

  // Initiate a call passing along the ID.
  socket.emit('initiateCall', callID)
}

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

callButton.onclick = async () => {
  makeCall()
}

// 1. Setup Webcam Stuff
webcamButton.onclick = async () => {

  webcamRunning = !webcamRunning;
    callButton.disabled = !callButton.disabled;

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

    peerConnection.addStream(localStream)
    remoteStream = new MediaStream();
    localVideo.srcObject = localStream;
  }
};

const enableButtons = () => {

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
