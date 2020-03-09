(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GreenAudioPlayer = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = require('./src/js/main-2').default;

},{"./src/js/main-2":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var GreenAudioPlayer =
/*#__PURE__*/
function () {
  function GreenAudioPlayer(player) {
    _classCallCheck(this, GreenAudioPlayer);

    this.audioPlayer = document.querySelector(player);
    var audioElement = this.audioPlayer.innerHTML;
    this.audioPlayer.classList.add('green-audio-player');
    this.audioPlayer.innerHTML = GreenAudioPlayer.getTemplate() + audioElement;
    this.isDevice = /ipad|iphone|ipod|android/i.test(window.navigator.userAgent.toLowerCase()) && !window.MSStream;
    this.playPauseBtn = this.audioPlayer.querySelector('.play-pause-btn');
    this.loading = this.audioPlayer.querySelector('.loading');
    this.sliders = this.audioPlayer.querySelectorAll('.slider');
    this.progress = this.audioPlayer.querySelector('.controls__progress');
    this.volumeBtn = this.audioPlayer.querySelector('.volume__button');
    this.volumeControls = this.audioPlayer.querySelector('.volume__controls');
    this.volumeProgress = this.volumeControls.querySelector('.volume__progress');
    this.player = this.audioPlayer.querySelector('audio');
    this.currentTime = this.audioPlayer.querySelector('.controls__current-time');
    this.totalTime = this.audioPlayer.querySelector('.controls__total-time');
    this.speaker = this.audioPlayer.querySelector('.volume__speaker');
    this.speakerOne = this.audioPlayer.querySelector('.volume__speaker-one');
    this.speakerTwo = this.audioPlayer.querySelector('.volume__speaker-two');
    this.speakerThree = this.audioPlayer.querySelector('.volume__speaker-three');
    this.draggableClasses = ['pin'];
    this.currentlyDragged = null;
    this.initEvents();
    this.overcomeIosLimitations();

    if ('autoplay' in this.player.attributes) {
      var playPauseButton = this.player.parentElement.querySelector('.play-pause-btn__icon');
      playPauseButton.attributes.d.value = 'M7.7 3q0-.4-.3-.7-.3-.3-.7-.3H4.5q-.4 0-.7.3-.3.3-.3.7v14q0 .4.3.7.3.3.7.3h2.2q.4 0 .7-.3.3-.3.3-.7V3zm9.8 0q0-.4-.3-.7-.3-.3-.7-.3h-2.2q-.4 0-.7.3-.3.3-.3.7v14q0 .4.3.7.3.3.7.3h2.2q.4 0 .7-.3.3-.3.3-.7V3z';
    }
  }

  _createClass(GreenAudioPlayer, [{
    key: "initEvents",
    value: function initEvents() {
      var _this = this;

      this.p = 0;
      var self = this;
      self.audioPlayer.addEventListener('mousedown', function (event) {
        if (self.isDraggable(event.target)) {
          self.currentlyDragged = event.target;
          var handleMethod = self.currentlyDragged.dataset.method;

          if (handleMethod === 'rewind' && self.player.paused === false) {
            GreenAudioPlayer.pausePlayer(self.player, 'rewind');
            self.p = 1;
          }

          var listener = self[handleMethod].bind(self);
          window.addEventListener('mousemove', listener, false);
          window.addEventListener('mouseup', function () {
            if (self.p > 0) {
              GreenAudioPlayer.playPlayer(self.player);
              self.p = 0;
            }

            self.currentlyDragged = false;
            window.removeEventListener('mousemove', listener, false);
          }, false);
        }
      }); // for mobile touches

      self.audioPlayer.addEventListener('touchstart', function (event) {
        if (self.isDraggable(event.target)) {
          var _event$targetTouches = _slicedToArray(event.targetTouches, 1);

          self.currentlyDragged = _event$targetTouches[0];
          var handleMethod = self.currentlyDragged.target.dataset.method;

          if (handleMethod === 'rewind' && self.player.paused === false) {
            GreenAudioPlayer.pausePlayer(self.player, 'rewind');
            self.p = 1;
          }

          var listener = self[handleMethod].bind(self);
          window.addEventListener('touchmove', listener, false);
          window.addEventListener('touchend', function () {
            if (self.p > 0) {
              GreenAudioPlayer.playPlayer(self.player);
              self.p = 0;
            }

            self.currentlyDragged = false;
            window.removeEventListener('touchmove', listener, false);
          }, false);
          event.preventDefault();
        }
      });
      this.playPauseBtn.addEventListener('click', this.togglePlay.bind(self));
      this.player.addEventListener('timeupdate', this.updateProgress.bind(self));
      this.player.addEventListener('volumechange', this.updateVolume.bind(self));
      self.player.volume = 0.81;
      this.player.addEventListener('loadedmetadata', function () {
        _this.totalTime.textContent = GreenAudioPlayer.formatTime(self.player.duration);
      });
      window.addEventListener('keydown', this.pressKb.bind(self), false);
      this.player.addEventListener('seeking', this.showLoadingIndicator.bind(self));
      this.player.addEventListener('seeked', this.hideLoadingIndicator.bind(self));
      this.player.addEventListener('canplay', this.hideLoadingIndicator.bind(self));
      this.player.addEventListener('ended', function () {
        GreenAudioPlayer.pausePlayer(self.player, 'ended');
        self.player.currentTime = 0;
        self.playPauseBtn.setAttribute('aria-label', 'Play');
      });
      this.volumeBtn.addEventListener('click', this.showhideVolume.bind(self));

      for (var i = 0; i < this.sliders.length; i++) {
        var pin = this.sliders[i].querySelector('.pin');
        this.sliders[i].addEventListener('click', self[pin.dataset.method].bind(self));
      }
    }
  }, {
    key: "overcomeIosLimitations",
    value: function overcomeIosLimitations() {
      var self = this;

      if (this.isDevice) {
        // iOS does not support "canplay" event
        this.player.addEventListener('loadedmetadata', this.hideLoadingIndicator.bind(self)); // iOS does not let "volume" property be set programmatically

        this.audioPlayer.querySelector('.volume').style.display = 'none';
        this.audioPlayer.querySelector('.controls').style.marginRight = '0';
      }
    }
  }, {
    key: "isDraggable",
    value: function isDraggable(el) {
      var canDrag = false;
      if (typeof el.classList === 'undefined') return false; // fix for IE 11 not supporting classList on SVG elements

      for (var i = 0; i < this.draggableClasses.length; i++) {
        if (el.classList.contains(this.draggableClasses[i])) {
          canDrag = true;
        }
      }

      return canDrag;
    }
  }, {
    key: "inRange",
    value: function inRange(event) {
      var touch = 'touches' in event; // instanceof TouchEvent may also be used

      var rangeBox = this.getRangeBox(event);
      var sliderPositionAndDimensions = rangeBox.getBoundingClientRect();
      var direction = rangeBox.dataset.direction;
      var min = null;
      var max = null;

      if (direction === 'horizontal') {
        min = sliderPositionAndDimensions.x;
        max = min + sliderPositionAndDimensions.width;
        var clientX = touch ? event.touches[0].clientX : event.clientX;
        if (clientX < min || clientX > max) return false;
      } else {
        min = sliderPositionAndDimensions.top;
        max = min + sliderPositionAndDimensions.height;
        var clientY = touch ? event.touches[0].clientY : event.clientY;
        if (clientY < min || clientY > max) return false;
      }

      return true;
    }
  }, {
    key: "updateProgress",
    value: function updateProgress() {
      var current = this.player.currentTime;
      var percent = current / this.player.duration * 100;
      this.progress.setAttribute('aria-valuenow', percent);
      this.progress.style.width = "".concat(percent, "%");
      this.currentTime.textContent = GreenAudioPlayer.formatTime(current);
    }
  }, {
    key: "updateVolume",
    value: function updateVolume() {
      this.volumeProgress.setAttribute('aria-valuenow', this.player.volume * 100);
      this.volumeProgress.style.height = "".concat(this.player.volume * 100, "%");

      if (this.player.volume >= 0.5) {
        this.speakerOne.attributes.stroke.value = '#008000';
        this.speakerTwo.attributes.stroke.value = '#008000';
        this.speakerThree.attributes.stroke.value = 'none';
      } else if (this.player.volume < 0.5 && this.player.volume > 0.001) {
        this.speakerOne.attributes.stroke.value = '#008000';
        this.speakerTwo.attributes.stroke.value = 'none';
        this.speakerThree.attributes.stroke.value = 'none';
      } else if (this.player.volume <= 0.001) {
        this.speakerOne.attributes.stroke.value = 'none';
        this.speakerTwo.attributes.stroke.value = 'none';
        this.speakerThree.attributes.stroke.value = '#008000';
        this.player.volume = 0;
      }
    }
  }, {
    key: "getRangeBox",
    value: function getRangeBox(event) {
      var rangeBox = event.target;
      var el = this.currentlyDragged;

      if (event.type === 'click' && this.isDraggable(event.target)) {
        rangeBox = event.target.parentElement.parentElement;
      }

      if (event.type === 'mousemove') {
        rangeBox = el.parentElement.parentElement;
      }

      if (event.type === 'touchmove') {
        rangeBox = el.target.parentElement.parentElement;
      }

      return rangeBox;
    }
  }, {
    key: "getCoefficient",
    value: function getCoefficient(event) {
      var touch = 'touches' in event; // instanceof TouchEvent may also be used

      var slider = this.getRangeBox(event);
      var sliderPositionAndDimensions = slider.getBoundingClientRect();
      var K = 0;

      if (slider.dataset.direction === 'horizontal') {
        // if event is touch
        var clientX = touch ? event.touches[0].clientX : event.clientX;
        var offsetX = clientX - sliderPositionAndDimensions.left;
        var width = sliderPositionAndDimensions.width;
        K = offsetX / width;
      } else if (slider.dataset.direction === 'vertical') {
        var height = sliderPositionAndDimensions.height;
        var clientY = touch ? event.touches[0].clientY : event.clientY;
        var offsetY = clientY - sliderPositionAndDimensions.top;
        K = 1 - offsetY / height;
      }

      return K;
    }
  }, {
    key: "rewind",
    value: function rewind(event) {
      if (this.inRange(event)) {
        this.player.currentTime = this.player.duration * this.getCoefficient(event);
      }
    }
  }, {
    key: "showVolume",
    value: function showVolume() {
      if (this.volumeBtn.getAttribute('aria-label') === 'Close') {
        this.volumeControls.classList.remove('hidden');
        this.volumeBtn.setAttribute('aria-label', 'Open');
      }
    }
  }, {
    key: "showhideVolume",
    value: function showhideVolume() {
      this.volumeControls.classList.toggle('hidden');

      if (this.volumeBtn.getAttribute('aria-label') === 'Open') {
        this.volumeBtn.setAttribute('aria-label', 'Close');
      } else {
        this.volumeBtn.setAttribute('aria-label', 'Open');
      }
    }
  }, {
    key: "changeVolume",
    value: function changeVolume(event) {
      if (this.inRange(event)) {
        this.player.volume = Math.round(this.getCoefficient(event) * 50) / 50;
      }
    }
  }, {
    key: "togglePlay",
    value: function togglePlay() {
      if (this.player.paused) {
        GreenAudioPlayer.playPlayer(this.player);
        this.playPauseBtn.setAttribute('aria-label', 'Pause');
      } else {
        GreenAudioPlayer.pausePlayer(this.player, 'toggle');
        this.playPauseBtn.setAttribute('aria-label', 'Play');
      }
    }
  }, {
    key: "setCurrentTime",
    value: function setCurrentTime(time) {
      var pos = this.player.currentTime;
      var end = Math.floor(this.player.duration);

      if (pos + time < 0 && pos === 0) {
        this.player.currentTime = this.player.currentTime;
      } else if (pos + time < 0) {
        this.player.currentTime = 0;
      } else if (pos + time > end) {
        this.player.currentTime = end;
      } else {
        this.player.currentTime += time;
      }
    }
  }, {
    key: "setVolume",
    value: function setVolume(volume) {
      if (this.isDevice) return;
      var vol = this.player.volume;

      if (vol + volume >= 0 && vol + volume < 1) {
        this.player.volume += volume;
      } else if (vol + volume <= 0) {
        this.player.volume = 0;
      } else {
        this.player.volume = 1;
      }
    }
  }, {
    key: "pressKb",
    value: function pressKb(event) {
      var evt = event || window.event;

      switch (evt.keyCode) {
        case 13:
        case 32:
          if (document.activeElement.parentNode === this.playPauseBtn) {
            this.togglePlay();
          } else if (document.activeElement.parentNode === this.volumeBtn || document.activeElement === this.sliders[1]) {
            if (document.activeElement === this.sliders[1]) {
              try {
                // IE 11 not allowing programmatic focus on svg elements
                this.volumeBtn.children[0].focus();
              } catch (error) {
                this.volumeBtn.focus();
              }
            }

            this.showhideVolume();
          }

          break;

        case 37:
          if (document.activeElement === this.sliders[0]) {
            this.setCurrentTime(-5);
          }

          break;

        case 39:
          if (document.activeElement === this.sliders[0]) {
            this.setCurrentTime(+5);
          }

          break;

        case 38:
          if (document.activeElement.parentNode === this.volumeBtn || document.activeElement === this.sliders[1]) {
            this.showVolume();
            this.setVolume(0.05);
          }

          break;

        case 40:
          if (document.activeElement.parentNode === this.volumeBtn || document.activeElement === this.sliders[1]) {
            this.showVolume();
            this.setVolume(-0.05);
          }

          break;

        default:
          break;
      }
    }
  }, {
    key: "showLoadingIndicator",
    value: function showLoadingIndicator() {
      this.loading.style.display = 'block';
    }
  }, {
    key: "hideLoadingIndicator",
    value: function hideLoadingIndicator() {
      this.loading.style.display = 'none';
    }
  }], [{
    key: "getTemplate",
    value: function getTemplate() {
      return "\n            <div class=\"holder\">\n                <div class=\"loading\">\n                    <div class=\"loading__spinner\"></div>\n                </div>\n\n                <div class=\"play-pause-btn\" aria-label=\"Play\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" tabindex=\"0\" focusable=\"true\">\n                        <path fill=\"#008000\" fill-rule=\"nonzero\" d=\"M16.4 10.5q.4-.2.4-.5t-.4-.55L5.05 2.5q-.35-.2-.6-.05-.25.15-.25.55v14q0 .4.25.55.25.15.6-.1L16.4 10.5z\" class=\"play-pause-btn__icon\"/>\n                    </svg>\n                </div>\n            </div>\n\n            <div class=\"controls\">\n                <span class=\"controls__current-time\" aria-live=\"off\" role=\"timer\">00:00</span>\n                <div class=\"controls__slider slider\" data-direction=\"horizontal\" tabindex=\"0\">\n                    <div class=\"controls__progress gap-progress\" aria-label=\"Time Slider\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-valuenow=\"0\" role=\"slider\">\n                        <div class=\"pin progress__pin\" data-method=\"rewind\"></div>\n                    </div>\n                </div>\n                <span class=\"controls__total-time\">00:00</span>\n            </div>\n\n            <div class=\"volume\">\n                <div class=\"volume__button\" aria-label=\"Close\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" tabindex=\"0\" focusable=\"true\">\n                        <path class=\"volume__speaker\" fill=\"#008000\" fill-rule=\"evenodd\" d=\"M11.85 2.7q-.25-.1-.55.15L7.75 5.5q-.75.6-1.8.6H2.8q-1 0-1 1v5.75q0 1 1 1h3.15q1 0 1 .05l4.35 3.2q.3.25.55.15.25-.15.25-.55V3.25q0-.4-.25-.55z\"/>\n                        <path class=\"volume__speaker-one\" stroke=\"#008000\" stroke-width=\"1.5\" stroke-linecap=\"round\" fill=\"none\" d=\"M13.35 6.1h.4l.55.15.65.4q1 1 1 3.35-.05 2.1-.85 3.05-.15.2-.7.6l-.65.2h-.4\"/>\n                        <path class=\"volume__speaker-two\" stroke=\"#008000\" stroke-width=\"1.5\" stroke-linecap=\"round\" fill=\"none\" d=\"M14.65 2.25h.4l.75.15q1.1.5 1.7 1.7 1.05 2.05 1 5.9 0 3.4-.9 5.45-.65 1.6-1.75 2.05-.35.2-.7.2h-.5\"/>\n                        <path class=\"volume__speaker-three\" stroke=\"none\" stroke-width=\"1.5\" stroke-linecap=\"round\" fill=\"none\" d=\"M13.35 7.25l5.4 5.4m-5.4 0l5.4-5.4\"/>\n                    </svg>\n                    <span class=\"message__offscreen\">Press Enter or Space to show volume slider.</span>\n                </div>\n                <div class=\"volume__controls hidden\">\n                    <div class=\"volume__slider slider\" data-direction=\"vertical\" tabindex=\"0\">\n                        <div class=\"volume__progress gap-progress\" aria-label=\"Volume Slider\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-valuenow=\"81\" role=\"slider\">\n                            <div class=\"pin volume__pin\" data-method=\"changeVolume\"></div>\n                        </div>\n                        <span class=\"message__offscreen\">Use Up/Down Arrow keys to increase or decrease volume.</span>\n                    </div>\n                </div>\n            </div>\n        ";
    }
  }, {
    key: "formatTime",
    value: function formatTime(time) {
      var min = Math.floor(time / 60);
      var sec = Math.floor(time % 60);
      return "".concat(min < 10 ? "0".concat(min) : min, ":").concat(sec < 10 ? "0".concat(sec) : sec);
    }
  }, {
    key: "pausePlayer",
    value: function pausePlayer(player, state) {
      var playPauseButton = player.parentElement.querySelector('.play-pause-btn__icon');
      playPauseButton.attributes.d.value = state === 'ended' ? 'M18.65 3.75q-.2-.15-.55.05l-6.2 3.6q-.35.2-.35.45t.4.4l4.9 1.8q.35.15.7-.05.35-.15.4-.55l.85-5.15q.05-.4-.15-.55zm-3.55 4.4l2.25.9q-.4-3-2.65-5-2.3-2-5.4-2-3.35 0-5.7 2.35Q1.2 6.75 1.2 10q0 2.2 1.15 4.1 1.15 1.9 3.1 2.95 1.8.9 3.85.9 2 0 3.75-.9 1.7-.85 2.8-2.4l-1.8-.95q-1.75 2.25-4.75 2.25-1.5 0-2.9-.7-1.45-.8-2.35-2.2-.85-1.4-.85-3.05 0-2.45 1.8-4.2t4.3-1.75q2 0 3.6 1.15 1.55 1.15 2.2 2.95z' : 'M16.4 10.5q.4-.2.4-.5t-.4-.55L5.05 2.5q-.35-.2-.6-.05-.25.15-.25.55v14q0 .4.25.55.25.15.6-.1L16.4 10.5z';
      player.pause();
    }
  }, {
    key: "playPlayer",
    value: function playPlayer(player) {
      var playPauseButton = player.parentElement.querySelector('.play-pause-btn__icon');
      playPauseButton.attributes.d.value = 'M7.7 3q0-.4-.3-.7-.3-.3-.7-.3H4.5q-.4 0-.7.3-.3.3-.3.7v14q0 .4.3.7.3.3.7.3h2.2q.4 0 .7-.3.3-.3.3-.7V3zm9.8 0q0-.4-.3-.7-.3-.3-.7-.3h-2.2q-.4 0-.7.3-.3.3-.3.7v14q0 .4.3.7.3.3.7.3h2.2q.4 0 .7-.3.3-.3.3-.7V3z';
      player.play();
    }
  }]);

  return GreenAudioPlayer;
}();

var _default = GreenAudioPlayer;
exports.default = _default;

},{}]},{},[1])(1)
});
