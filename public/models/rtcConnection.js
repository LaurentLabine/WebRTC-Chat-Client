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
        socket.emit('newicecandidate', event.candidate);
      }
    });
    
    // Once a second user joins a call, the signaling process starts.
    socket.on('otheruserjoined', async (payload) => {
    
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    payload.offer = offer
    socket.emit('offercreated', payload);
    })
    
    // Offer Received by Server.  Setting it as remote session description
    socket.on('receivedoffer', async (payload) => {
    
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    payload.answer = answer
    
    socket.emit('answeremitted', payload);
    })
    
    // Call Initiator receives the answer and sets remote SDP
    socket.on('receivedanswer', async (payload) => {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
    })

    socket.on('remoteicecandidate', async (candidate) => {
      try {
          await this.peerConnection.addIceCandidate(candidate);
      } catch (e) {
          console.error('Error adding received ice candidate', e);
      }
    })
  }

  initiateCall = (callID) => {
    socket.emit('registercall', callID)
  }

  addLocalStream = () => {
    this.peerConnection.addStream(this.localStream)
  }

}