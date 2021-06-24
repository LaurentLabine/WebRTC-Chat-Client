import { makeId } from './util/makeId.js'
import RTCConnection from './models/rtcConnection.js'

const webRTCConnection = new RTCConnection();
let webcamRunning = false

callButton.onclick = async () => {
  // If the value is empty, we create a random one..
  const callID = callIDInput.value === '' ? makeId() : callIDInput.value
  callIDInput.value = callID;
  // Initiate a call passing along the ID.
  webRTCConnection.initiateCall(callID)
}

// Start Webcam Stuff
webcamButton.onclick = async () => {
  if(webcamRunning){

  } else {
  try{
    callButton.disabled = !callButton.disabled;

    webRTCConnection.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        sampleSize: 8,
        echoCancellation: true
      }
    });
    webRTCConnection.addLocalStream()
    localVideo.srcObject = webRTCConnection.localStream;
  } catch (e) {
    alert(e.message)
  }
}
webcamRunning = !webcamRunning;
  }
