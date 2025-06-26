const match = document.querySelector('.match');
const candles = document.querySelectorAll('.candle');
const message = document.getElementById('message');
const spotifyPlayer = document.getElementById('spotify-player');
let lit = false;

// When user clicks the match (lights candles)
match.addEventListener('click', () => {
  candles.forEach(c => c.querySelector('.flame').style.display = 'block');
  lit = true;
  message.textContent = "Candle is lit! Blow near your mic or tap any candle to blow out 🎉";
  startMicListening();
});

// Click on any candle to manually blow out
candles.forEach(candle => {
  candle.addEventListener('click', extinguishCandles);
});

// Extinguish candles + show Spotify
function extinguishCandles() {
  if (!lit) return;
  candles.forEach(c => c.querySelector('.flame').style.display = 'none');
  lit = false;
  message.textContent = "🎵 Make a wish!";
  stopMicListening();
  spotifyPlayer.style.display = 'block';
}

// === Microphone Blow Detection ===
let audioContext, analyser, micStream, dataArray;

function startMicListening() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('Microphone not supported on this browser.');
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      micStream = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      micStream.connect(analyser);
      dataArray = new Uint8Array(analyser.fftSize);
      listenForBlow();
    })
    .catch(err => {
      console.warn('Mic access denied or unavailable.', err);
    });
}

function listenForBlow() {
  analyser.getByteTimeDomainData(dataArray);
  let maxAmplitude = Math.max(...dataArray);

  if (maxAmplitude > 200) {  // Sensitivity threshold (adjustable)
    extinguishCandles();
  } else if (lit) {
    requestAnimationFrame(listenForBlow);
  }
}

function stopMicListening() {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  if (micStream && micStream.mediaStream) {
    micStream.mediaStream.getTracks().forEach(track => track.stop());
  }
  micStream = null;
}
