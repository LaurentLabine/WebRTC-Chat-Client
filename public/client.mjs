import { makeId } from './util/makeId.js'
// import { initializePeerConnection, initiateCall } from './util/rtcPeerConnection.js'
// import RTCConnection from '/'
import RTCConnection from './models/rtcConnection.js'

let localStream = null;
let webcamRunning = false;

// HTML elements
const webcamButton = document.getElementById('webcamButton');
const localVideo = document.getElementById('localVideo');
const callButton = document.getElementById('callButton');
const callIDInput = document.getElementById('callIDInput');
const debugButton = document.getElementById('debugButton')

const webRTCConnection = new RTCConnection();

//Debugging button 
debugButton.addEventListener('click', () => {
  // console.log(peerConnection)
})

callButton.onclick = async () => {
  // If the value is empty, we create a random one..
  const callID = callIDInput.value === '' ? makeId() : callIDInput.value
  callIDInput.innerText = callID;
  // Initiate a call passing along the ID.
  webRTCConnection.initiateCall(callID)
}

// 1. Setup Webcam Stuff
webcamButton.onclick = async () => {

  webcamRunning = !webcamRunning;
    callButton.disabled = !callButton.disabled;

  // if(localStream){
  //   localStream.getTracks().forEach(track => track.stop())
  //   localStream = null
  //   localVideo.srcObject = null
  // }
  // else{

    webRTCConnection.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true, 
    });

    // peerConnection.lo

    webRTCConnection.addLocalStream()
    localVideo.srcObject = webRTCConnection.localStream;
  }
