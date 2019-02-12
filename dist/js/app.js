"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

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
    this.playPause = this.audioPlayer.querySelector('.play-pause-btn__icon');
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
    this.draggableClasses = ['pin'];
    this.currentlyDragged = null;
    this.initEvents();
    this.directionAware();
  }

  _createClass(GreenAudioPlayer, [{
    key: "initEvents",
    value: function initEvents() {
      var _this = this;

      var self = this;
      self.audioPlayer.addEventListener('mousedown', function (event) {
        if (self.isDraggable(event.target)) {
          self.currentlyDragged = event.target;
          var handleMethod = self.currentlyDragged.dataset.method;
          var listener = self[handleMethod].bind(self);
          window.addEventListener('mousemove', listener, false);
          window.addEventListener('mouseup', function () {
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
          var listener = self[handleMethod].bind(self);
          window.addEventListener('touchmove', listener, false);
          window.addEventListener('touchend', function () {
            self.currentlyDragged = false;
            window.removeEventListener('touchmove', listener, false);
          }, false);
          event.preventDefault();
        }
      });
      this.playPauseBtn.addEventListener('click', this.togglePlay.bind(self));
      this.player.addEventListener('timeupdate', this.updateProgress.bind(self));
      this.player.addEventListener('volumechange', this.updateVolume.bind(self));
      this.player.addEventListener('loadedmetadata', function () {
        _this.totalTime.textContent = GreenAudioPlayer.formatTime(self.player.duration);
      });
      this.player.addEventListener('seeking', this.showLoadingIndicator.bind(self));
      this.player.addEventListener('canplay', this.hideLoadingIndicator.bind(self));
      this.player.addEventListener('ended', function () {
        self.playPause.attributes.d.value = 'M18 12L0 24V0';
        self.player.currentTime = 0;
      });
      this.volumeBtn.addEventListener('click', function () {
        self.volumeBtn.classList.toggle('open');
        self.volumeControls.classList.toggle('hidden');
      });
      window.addEventListener('resize', self.directionAware.bind(self));
      window.addEventListener('scroll', self.directionAware.bind(self));
      this.sliders.forEach(function (slider) {
        var pin = slider.querySelector('.pin');
        slider.addEventListener('click', self[pin.dataset.method].bind(self));
      });
    }
  }, {
    key: "isDraggable",
    value: function isDraggable(el) {
      var canDrag = false;
      var classes = Array.from(el.classList);
      this.draggableClasses.forEach(function (draggable) {
        if (classes.indexOf(draggable) !== -1) {
          canDrag = true;
        }
      });
      return canDrag;
    }
  }, {
    key: "inRange",
    value: function inRange(event) {
      var touch = 'touches' in event; // instanceof TouchEvent may also be used

      var rangeBox = this.getRangeBox(event);
      var rect = rangeBox.getBoundingClientRect();
      var direction = rangeBox.dataset.direction;
      var min = null;
      var max = null;

      if (direction === 'horizontal') {
        min = rangeBox.offsetLeft;
        max = min + rangeBox.offsetWidth;
        var clientX = touch ? event.touches[0].clientX : event.clientX;
        if (clientX < min || clientX > max) return false;
      } else {
        min = rect.top;
        max = min + rangeBox.offsetHeight;
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
      this.progress.style.width = "".concat(percent, "%");
      this.currentTime.textContent = GreenAudioPlayer.formatTime(current);
    }
  }, {
    key: "updateVolume",
    value: function updateVolume() {
      this.volumeProgress.style.height = "".concat(this.player.volume * 100, "%");

      if (this.player.volume >= 0.5) {
        this.speaker.attributes.d.value = 'M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z';
      } else if (this.player.volume < 0.5 && this.player.volume > 0.05) {
        this.speaker.attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667M17.333 11.373C17.333 9.013 16 6.987 14 6v10.707c2-.947 3.333-2.987 3.333-5.334z';
      } else if (this.player.volume <= 0.05) {
        this.speaker.attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667';
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
      var rect = slider.getBoundingClientRect();
      var K = 0;

      if (slider.dataset.direction === 'horizontal') {
        // if event is touch
        var clientX = touch ? event.touches[0].clientX : event.clientX;
        var offsetX = clientX - slider.offsetLeft;
        var width = slider.clientWidth;
        K = offsetX / width;
      } else if (slider.dataset.direction === 'vertical') {
        var height = slider.clientHeight;
        var clientY = touch ? event.touches[0].clientY : event.clientY;
        var offsetY = clientY - rect.top;
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
    key: "changeVolume",
    value: function changeVolume(event) {
      if (this.inRange(event)) {
        this.player.volume = Math.round(this.getCoefficient(event) * 10) / 10;
      }
    }
  }, {
    key: "togglePlay",
    value: function togglePlay() {
      if (this.player.paused) {
        this.playPause.attributes.d.value = 'M0 0h6v24H0zM12 0h6v24h-6z';
        this.player.play();
      } else {
        this.playPause.attributes.d.value = 'M18 12L0 24V0';
        this.player.pause();
      }
    }
  }, {
    key: "showLoadingIndicator",
    value: function showLoadingIndicator() {
      this.playPauseBtn.style.display = 'none';
      this.loading.style.display = 'block';
    }
  }, {
    key: "hideLoadingIndicator",
    value: function hideLoadingIndicator() {
      this.playPauseBtn.style.display = 'block';
      this.loading.style.display = 'none';
    }
  }, {
    key: "directionAware",
    value: function directionAware() {
      this.volumeControls.classList.remove('top', 'middle', 'bottom');

      if (window.innerHeight < 250) {
        this.volumeControls.classList.add('middle');
      } else if (this.audioPlayer.getBoundingClientRect().top < 154) {
        this.volumeControls.classList.add('bottom');
      } else {
        this.volumeControls.classList.add('top');
      }
    }
  }], [{
    key: "getTemplate",
    value: function getTemplate() {
      return "\n            <div class=\"loading\">\n                <div class=\"loading__spinner\"></div>\n            </div>\n            <div class=\"play-pause-btn\">\n                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"24\" viewBox=\"0 0 18 24\">\n                    <path fill=\"#566574\" fill-rule=\"evenodd\" d=\"M18 12L0 24V0\" class=\"play-pause-btn__icon\"/>\n                </svg>\n            </div>\n    \n            <div class=\"controls\">\n                <span class=\"controls__current-time\">0:00</span>\n                <div class=\"controls__slider slider\" data-direction=\"horizontal\">\n                    <div class=\"controls__progress progress\">\n                        <div class=\"pin progress__pin\" data-method=\"rewind\"></div>\n                    </div>\n                </div>\n                <span class=\"controls__total-time\">0:00</span>\n            </div>\n    \n            <div class=\"volume\">\n                <div class=\"volume__button\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n                        <path class=\"volume__speaker\" fill=\"#566574\" fill-rule=\"evenodd\" d=\"M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z\"/>\n                    </svg>\n                </div>\n                <div class=\"volume__controls hidden\">\n                    <div class=\"volume__slider slider\" data-direction=\"vertical\">\n                        <div class=\"volume__progress progress\">\n                            <div class=\"pin volume__pin\" data-method=\"changeVolume\"></div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            \n        ";
    }
  }, {
    key: "formatTime",
    value: function formatTime(time) {
      var min = Math.floor(time / 60);
      var sec = Math.floor(time % 60);
      return "".concat(min, ":").concat(sec < 10 ? "0".concat(sec) : sec);
    }
  }]);

  return GreenAudioPlayer;
}();

window.GreenAudioPlayer = GreenAudioPlayer;