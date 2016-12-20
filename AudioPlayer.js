AudioPlayer.numInstances = 0;

function AudioPlayer(options) {
  //Options
  options = options || {};
  this.file = options.file === undefined ? null : options.file;
  this.element = options.element === undefined ? "#player" : options.element;
  this.width = options.width === undefined ? 500 : options.width;
  this.height = options.height === undefined ? 200 : options.height;
  this.scaleFactor = options.scaleFactor === undefined ? 60 : options.scaleFactor;
  this.amplify = options.amplify === undefined ? 2 : options.amplify;
  this.ceiling = options.ceiling === undefined ? this.height/2 : options.ceiling;

  //Background, highlight and hover respectively.
  this.bgColour = options.bgColour === undefined ? "#7a7b7b" : options.bgColour;
  this.hlColour = options.hlColour === undefined ? "#f77007" : options.hlColour;
  this.hvColour = options.hvColour === undefined ? "#bfc1c1" : options.hvColour;

  //Internal stuff
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  this._playing = false;
  this._audioContext = new AudioContext();
  //Will be set to true when the rest of the init stuff is finished.
  this._loaded = false;
  AudioPlayer.numInstances++;
  this._audioData = [];
  this._playTime = 0;
  this._playTimer = null;
  this._mouseX = 0;
  this._firstRun = true;
  this._loadDeltaTime = 0;
  //Build audio player.
  this._init();
}

AudioPlayer.prototype._init = function() {
  this._createCanvas();
  this._loadAudioFile();
  this._draw();
};

//Starts playing the audio.
AudioPlayer.prototype.play = function() {
  if (!this._playing) {
    this._audioSource = this._audioContext.createBufferSource();
    this._audioSource.buffer = this._audioBuffer;
    this._audioSource.connect(this._audioContext.destination);
    this._audioSource.start(0, this._playTime);
    this._playing = true;
    var self = this;
    //NEED to stop trusting this as an accurate time source. Will lag arbitrarily.
    //TODO - Calculate time passed since last tick in the callback here. Add that to the _playTime variable.
    this._playTimer = window.setInterval(function() {
      self._playTime += 0.05;
    }, 50);
  }
};

//Pauses the audio.
AudioPlayer.prototype.pause = function() {
  if(this._playing) {
    this._audioSource.stop();
    this._playing = false;
    clearInterval(this._playTimer);
  }
};

//Draws our frames.
AudioPlayer.prototype._draw = function() {
  //Clear the canvas.
  var backCanvas = document.createElement("canvas");
  backCanvas.width = this.width;
  backCanvas.height = this.height;
  var backContext = backCanvas.getContext('2d');
  
  backContext.clearRect(0, 0, this.width, this.height);
  this._drawingContext.clearRect(0, 0, this.width, this.height);
  
  if (this._loaded) {
    var waveImage = this._waveContext.getImageData(0, 0, this.width, this.height);
    var hlWaveImage = this._hlWaveContext.getImageData(0, 0, this.width, this.height);
    backContext.putImageData(waveImage, 0, 0);

    if(this._playTime > 0) {
      var playSample = this._playTime * this._audioContext.sampleRate;
      var playScaledSample = playSample / this.scaleFactor;
      var hlWaveX = this._xStep * playScaledSample;
      backContext.putImageData(hlWaveImage, 0, 0, 0, 0, hlWaveX, this.height);
    }

      //Draw seek line if needed.
    if(this._mouseX > 0) {
      backContext.strokeStyle = this.hvColour;
      backContext.beginPath();
      backContext.moveTo(this._mouseX, this.height);
      backContext.lineTo(this._mouseX, 0);
      backContext.stroke();
    }
  
    //Render the frame.
    var image = backContext.getImageData(0, 0, this.width, this.height);
    this._drawingContext.putImageData(image, 0, 0);

    } else {
      //Not loaded yet. Draw Animation
      this._drawLoadingAnimation();
    }
  
  //Request our next frame.
  var self = this;
  window.requestAnimationFrame(function() {
    self._draw();
  });
};

AudioPlayer.prototype._drawLoadingAnimation = function () {
  this._loadDeltaTime += 0.1;
  
  this._drawingContext.strokeStyle = this.hvColour;
  this._drawingContext.fillStyle = this.hvColour;
  for(var i = 0; i < 8; i++) {
    var heightOffset = Math.sin(this._loadDeltaTime + i) * 20;
    this._drawingContext.beginPath();
    this._drawingContext.arc((this.width/2) - (i * 20) + 60, (this.height/2) + heightOffset, 5, 0, 360);
    this._drawingContext.fill();
    this._drawingContext.stroke();
  }
  
  
};

AudioPlayer.prototype._createCanvas = function() {
  //Create the canvas.
  var buttonContainerID = "ac-controls" + AudioPlayer.numInstances;
  var canvasContainerID = "ac-surface" + AudioPlayer.numInstances;
  var playButtonID = "ac-play-btn" + AudioPlayer.numInstances;
  var canvasID = "ac-" + AudioPlayer.numInstances;
  var containerClass = "ac-container";
  var playContainerClass = "ac-play-container";
  var playClass = "ac-play";


  $('<div>', {
    id: buttonContainerID,
    class: containerClass + " " + playContainerClass
  }).css({
    width:  this.height + "px",
    height: this.height + "px"
  }).appendTo(this.element);

  $('<div>', {
    id: canvasContainerID,
    class: containerClass
  }).css({
    width: this.width + "px",
    height: this.height + "px"
  }).appendTo(this.element);

  $('<canvas>', {
    id: canvasID
  }).prop({
    width: this.width,
    height: this.height
  }).appendTo("#"+canvasContainerID);

  $('<button>', {
    id: playButtonID,
    class: playClass
  }).css({
    width: (this.height - 30) + "px",
    height: (this.height - 30) + "px"
  }).appendTo("#"+buttonContainerID);

  this._drawingCanvas = document.getElementById(canvasID);
  this._drawingContext = this._drawingCanvas.getContext('2d');
  var self = this;
  $("#"+canvasID).mousemove(function(e) {
    self._mouseX = (e.clientX - this.height)-10;
  });
  $("#"+canvasID).mouseleave(function() {
    self._mouseX = 0;
  });
  $("#"+canvasID).on('click', function() {
    if(self._mouseX > 0) {
      var numElements = (self._audioData.length / self.scaleFactor);
      var samplesPerPixel = numElements / self.width;
      var selectedSample = (self._mouseX * samplesPerPixel)*self.scaleFactor;
      var selectedTime = selectedSample / self._audioContext.sampleRate;
      if(self._playing) {
        self.pause();
        self._playTime = selectedTime;
        self.play();
      } else {
        self._playTime = selectedTime;
      }
    }
  });
};

AudioPlayer.prototype._generateLayers = function() {
  this._waveCanvas = document.createElement("canvas");
  this._waveCanvas.width = this.width;
  this._waveCanvas.height = this.height;
  this._waveContext = this._waveCanvas.getContext('2d');

  this._hlWaveCanvas = document.createElement("canvas");
  this._hlWaveCanvas.width = this.width;
  this._hlWaveCanvas.height = this.height;
  this._hlWaveContext = this._hlWaveCanvas.getContext('2d');

  var currentX = 0;
  var midY = (this.height / 2);
  var currentY = midY;
  
  for (var i = 0; i < this._sampledData.length; i++) {
      //Have to draw a point here.
      var scaledSample = this._sampledData[i];

      this._waveContext.strokeStyle = this.bgColour;
      this._waveContext.beginPath();
      this._waveContext.moveTo(currentX-this._xStep, currentY);
      this._waveContext.lineTo(currentX, (midY + scaledSample));
      this._waveContext.stroke();

      this._hlWaveContext.strokeStyle = this.hlColour;
      this._hlWaveContext.beginPath();
      this._hlWaveContext.moveTo(currentX-this._xStep, currentY);
      this._hlWaveContext.lineTo(currentX, (midY + scaledSample));
      this._hlWaveContext.stroke();

      currentY = (midY + scaledSample);
      currentX += this._xStep;
  }
};

AudioPlayer.prototype._loadAudioFile = function() {
  var request = new XMLHttpRequest();
  request.open("GET", this.file, true);
  request.responseType = "arraybuffer";
  var self = this;

  //On successful load.
  request.onload = function() {
    if (request.status == 200) {
      self._audioContext.decodeAudioData(request.response, function(buffer) {
        self._audioBuffer = buffer;
        self._audioSource = self._audioContext.createBufferSource();
        self._audioSource.buffer = self._audioBuffer;
        self._audioSource.connect(self._audioContext.destination);
        

        //Mix two channels down to mono if necessary for waveform drawing.
        if (self._audioBuffer.numberOfChannels > 1) {
          //Stereo
          var leftChannel = self._audioBuffer.getChannelData(0);
          var rightChannel = self._audioBuffer.getChannelData(1);

          //Average samples into a single channel.
          for (var i = 0; i < leftChannel.length; i++) {
            self._audioData[i] = (leftChannel[i] + rightChannel[i]) / 2;
          }
        } else {
          //Mono
          self._audioData = self._audioBuffer.getChannelData(0);
        }
        
        //Average samples for drawing.
        self._numElements = Math.round(self._audioData.length / self.scaleFactor);
        self._xStep = (self.width / self._numElements);
        self._sampledData = [];

        var avgSample = 0;

        for(var i = 0; i < self._audioData.length; i++) {
          if((i % self.scaleFactor) == 0) {
              var scaledSample = ((avgSample / self.scaleFactor) * self.amplify);
              self._sampledData[i/self.scaleFactor] = Math.min(Math.max(scaledSample, -(self.ceiling)), self.ceiling);
              avgSample = 0;
          }
          avgSample += self._audioData[i] * self.height;
        }
        
        self._generateLayers();
        //Wait a couple of seconds to show off the loading animation.
        setTimeout(function(){self._loaded = true;}, 2000);
      }, function(e) {
        //Some sort of error in decoding the audio data.
        throw new AudioPlayerException("Error decoding audio data: " + e.err);
      });
    } else {
      //Not loaded successfully.
      throw new AudioPlayerException("Unable to load audio file '" + self.file + "'");
    }
  };

  //On Error
  request.onerror = function() {
    throw new AudioPlayerException("Unable to load audio file '" + self.file + "'");
  };

  request.send();
};

function AudioPlayerException(message) {
  this.message = message;
  this.name = "AudioPlayerException";
}
