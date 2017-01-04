# AudioPlayer.js
A small audio player widget. Draws a waveform, allows the user to play, seek etc.

[![screenshot.png](https://s23.postimg.org/z1l9dmmgb/screenshot.png)](https://postimg.org/image/6oprn60pz/)

Demo at: [AudioPlayer.js on CodePen](http://codepen.io/darrena092/pen/YpBQjN/)

Still very much in development, and pull requests are appreciated!

## Usage
Can be dropped in as follows:

```
  var testPlayer = new AudioPlayer({
    element: "#playerContainer",
    file: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/616095/clip.mp3",
    width: 500
  });
```

OR

```
<div class="playerOuter" data-ap data-ap-file="myfile.mp3" data-ap-width="500" data-ap-amplify="2" data-ap-scaleFactor="60"></div>
```

## Options
The script has the following options, which can be set when the player is instanced:

* file : The URL where the audio file is located.
* element : The full name of the DOM element to place the audio player inside.
* width : The width of the player (in pixels).
* scaleFactor (optional) : The amount by which the audio buffer is scaled in memory before being drawn (higher values = more responsive).
* amplify (optional): Used to scale the waveform up. Think of it as turning up the volume. Has no effect on the sound that is output.
* ceiling (optinal) : Defines the highest allowed peak of the waveform graphic (in pixels). Values above this will be clipped if it is set.
* bgColour (optional) : The colour of the waveform when it is not playing, or highlighted.
* hlColour (optional) : The colour of the highlighted waveform (happens when it is playing for example).
* hvColour (optional) : The colour of the seek bar.

-- Note that the height is hard coded to 100px --

Can also be dropped in using data tags. For example:
```
<div class="playerOuter" data-ap data-ap-file="myfile.mp3" data-ap-width="500" data-ap-amplify="2" data-ap-scaleFactor="60"></div>
```

## Installing With Bower
Installing with Bower is probably the easiest way of including AudioPlayer.js in your project. Use the following:
```
bower install AudioPlayer.js
```

## Dependencies
AudioPlayer.js requires Jquery and FontAwesome.

## Other Info
Throws an `AudioPlayerException` with an error message on any kind of issue. Can be caught and handled. This will happen when an instance is created.

The current version is v0.0.1. Note that this is not production ready.

## Licensing
Audioplayer.js is covered by the MIT License. Feel free to use it in projects, commercial or non-commercial. I'd love to hear from you if you find it useful.
[MIT License Info](https://opensource.org/licenses/MIT)