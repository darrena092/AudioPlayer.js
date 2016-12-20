# AudioPlayer
A small audio player widget. Draws a waveform, allows the user to play, seek etc.

## Usage
Can be dropped in as follows:

```
  var testPlayer = new AudioPlayer({
    element: "#playerContainer",
    file: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/616095/clip.mp3",
    width: 1090,
    height: 150
  });
```

## Options
The script has the following options, which can be set when the player is instanced:

* file : The URL where the audio file is located.
* element : The full name of the DOM element to place the audio player inside.
* width : The width of the player (in pixels).
* height : The height of the player (in pixels).
* scaleFactor (optional) : The amount by which the audio buffer is scaled in memory before being drawn (higher values = more responsive).
* amplify (optional): Used to scale the waveform up. Think of it as turning up the volume. Has no effect on the sound that is output.
* ceiling (optinal) : Defines the highest allowed peak of the waveform graphic (in pixels). Values above this will be clipped if it is set.
* bgColour (optional) : The colour of the waveform when it is not playing, or highlighted.
* hlColour (optional) : The colour of the highlighted waveform (happens when it is playing for example).
* hvColour (optional) : The colour of the seek bar.

## Other Info
Throws an `AudioPlayerException` with an error message on any kind of issue. Can be caught and handled. This will happen when an instance is created.