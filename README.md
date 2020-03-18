# Green Audio Player

![npm](https://img.shields.io/npm/v/green-audio-player.svg)
![GitHub](https://img.shields.io/github/license/greghub/green-audio-player.svg)
![GitHub file size in bytes](https://img.shields.io/github/size/greghub/green-audio-player/dist/js/green-audio-player.min.js.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/greghub/green-audio-player.svg)


Based on a [pen](https://codepen.io/gregh/pen/NdVvbm) I've created 2 years ago.
Due to requests from many people I decided to create a repository, 
containing an improved version of the Green Audio Player including the support for multiple audio players on a single page.

## [Online demo](https://greghub.github.io/green-audio-player/)

<img src="https://i.imgur.com/CME3A0L.png" alt="Green Audio Player" width="680">

## Installation

#### Github

Download repository ZIP.

#### CDN

Alternatively, you can load it from CDN:

```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/greghub/green-audio-player/dist/css/green-audio-player.min.css">
<script src="https://cdn.jsdelivr.net/gh/greghub/green-audio-player/dist/js/green-audio-player.min.js"></script>
```

#### NPM

```
npm i green-audio-player
```

## Usage

Include the `green-audio-player.css` or `green-audio-player.min.css` file:

```html
<link rel="stylesheet" type="text/css" href="{path}/dist/css/green-audio-player.min.css">
```
and `green-audio-player.js` file (or `green-audio-player.min.js`): 
```html
<script src="{path}/dist/js/green-audio-player.js"></script>
```

Add the audio tag inside of a container. You are free to add any attributes.
Green Audio Player does not change the audio tag, so for example if you want the audio to loop,
you can add the loop attribute to the audio tag.

```html
<div class="gap-example">
    <audio>
        <source src="audio/example-1.mp3" type="audio/mpeg">
    </audio>
</div>
```

This will initialize the Green Audio Player
```javascript
new GreenAudioPlayer('.gap-example');
```

You can add multiple players on a single page.

There's a shorter method for initializing several Green Audio Players:
```js
GreenAudioPlayer.init({
    selector: '.player', // inits Green Audio Player on each audio container that has class "player"
    stopOthersOnPlay: true
});
```

Refer to `/examples` folder for demos of single and multiple players.

## Options

| Option | Description | Values | Default |
|--------|-------------|--------|---------|
| stopOthersOnPlay | Whether other audio players shall get paused when hitting play | `true`, `false` | `false`
| showDownloadButton | Allow audio file download. Displays the download button. | `true`, `false` | `false`
| showBuffuringIcon | Spinner icon indicates player is currently buffering. | `true`, `false` | `false`
| enableKeystrokes | Players have keystrokes associated with functions. | `true`, `false` | `false`
| showTooltips | Labels for play, volume and download buttons visible on focus | `true`, `false` | `false`

The tooltip option requires setting `showTooltips` to true on your player.

Buffering is detected on most, not all, browsers with `showBuffuringIcon` enabled. 

## Accessibility

In order to improve accessibility, keyboard navigation can be enabled, by passing the `enableKeystrokes` option.
By default, the outline is disabled on elements.
If you want to add outline to elements add `player-accessible` class to the player element:

```html
<div class="player-1 player-accessible">
...
</div>
```

You can focus on elements with Tab key and use the following keys to use the player controls.

| Key | Action |
|--------|-------------|
| Tab | Focus on the next element | 
| Shift + Tab | Focus on the previous element | 
| Enter or Spacebar | Pause/Play | 
| Right Arrow | Fast-forward | 
| Left Arrow | Rewind | 
| Enter or Spacebar | Show/hide volume slider |
| Up Arrow | Increase volume |
| Down Arrow | Decrease volume |
| Enter | Download | 
