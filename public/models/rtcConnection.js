const socket = io();

export default class RTCConnection {
  constructor(configuration) {
    this.localStream = new MediaStream();
    this.remoteStream = new MediaStream();
    this.peerConnection = new RTCPeerConnection(configuration);

    // Events Implementation
    this.peerConnection.addEventListener('addstream', event => {
      this.remoteStream = event.stream;
      remoteVideo.srcObject = this.remoteStream;
    });
    
    this.peerConnection.addEventListener('connectionstatechange', () => {
      if (this.peerConnection.connectionState === 'connected') {
          console.log('Connected')
      }
    });
    
    // Listen for local ICE candidates on the local RTCPeerConnection
    this.peerConnection.addEventListener('icecandidate', event => {
      if (event.candidate) {
        socket.emit('new-ice-candidate', event.candidate);
      }
    });
    
    //Handshake Logic
    socket.on('remote-ice-candidate', async (candidate) => {
      try {
          await this.peerConnection.addIceCandidate(candidate);
      } catch (e) {
          console.error('Error adding received ice candidate', e);
      }
    })
    
    // Created offer and set it as local description for caller.
    socket.on('OtherJoined', async (payload) => {
    
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    socket.emit('OfferCreated', {caller: payload.caller, target: payload.target, offer : offer});
    })
    
    // Offer Received by Server.  Setting it as remote session description
    socket.on('ReceivedOffer', async (payload) => {
    
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    socket.emit('answer', {caller: payload.caller, target: payload.target, offer : payload.offer, answer: answer});
    })
    
    // Call Initiator receives the answer and sets remote SDP
    socket.on('ReceivedAnswer', async (payload) => {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
    })
  }

  initiateCall = (callID) => {
    socket.emit('initiateCall', callID)
  }

  addLocalStream = () => {
    this.peerConnection.addStream(this.localStream)
  }

}