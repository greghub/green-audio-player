const is_device = /ipad|iphone|ipod|android/i.test(window.navigator.userAgent.toLowerCase()) && !window.MSStream;

class GreenAudioPlayer {
    constructor(player, options) {
        this.audioPlayer = typeof player === 'string' ? document.querySelector(player) : player;
        const opts = options || {};

        const audioElement = this.audioPlayer.innerHTML;
        this.audioPlayer.classList.add('green-audio-player');
        this.audioPlayer.innerHTML = GreenAudioPlayer.getTemplate() + audioElement;

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
        this.download = this.audioPlayer.querySelector('.download');
        this.downloadLink = this.audioPlayer.querySelector('.download__link');
        this.span = this.audioPlayer.querySelectorAll('.message__offscreen');
        this.draggableClasses = ['pin'];
        this.currentlyDragged = null;
        this.stopOthersOnPlay = opts.stopOthersOnPlay || false;

        if (this.stopOthersOnPlay) {
            for (let i = 0; i < this.span.length; i++) {this.span[i].outerHTML = ""}
        }

        if (opts.showDownloadButton || false) {
            this.showDownload();
        }

        this.initEvents();
        this.directionAware();
        this.overcomeIosLimitations();

        if ('autoplay' in this.player.attributes) {
            const playPauseButton = this.player.parentElement.querySelector('.play-pause-btn__icon');
            playPauseButton.attributes.d.value = 'M0 0h6v24H0zM12 0h6v24h-6z';
        }
    }

    static init(options) {
        const players = document.querySelectorAll(options.selector);

        players.forEach((player) => {
            /* eslint-disable no-new */
            new GreenAudioPlayer(player, options);
        });
    }

    static getTemplate() {
        return `
            <div class="holder">
                <div class="loading">
                    <div class="loading__spinner"></div>
                </div>

                <div class="play-pause-btn" aria-label="Play">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
                        <path fill="#566574" fill-rule="evenodd" d="M18 12L0 24V0" class="play-pause-btn__icon"/>
                    </svg>
                    <span class="message__offscreen">Press Spacebar to toggle pause and play.</span>
                </div>
            </div>

            <div class="controls">
                <span class="controls__current-time" aria-live="off" role="timer">00:00</span>
                <div class="controls__slider slider" data-direction="horizontal">
                    <div class="controls__progress gap-progress" aria-label="Time Slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" role="slider">
                        <div class="pin progress__pin" data-method="rewind"></div>
                    </div>
                    <span class="message__offscreen">Use Left/Right Arrow keys to fast-forward or rewind in increments.</span>
                </div>
                <span class="controls__total-time">00:00</span>
            </div>

            <div class="volume">
                <div class="volume__button open" aria-label="Open">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path class="volume__speaker" fill="#566574" fill-rule="evenodd" d="M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z"/>
                    </svg>
                    <span class="message__offscreen">Press Enter to show volume slider.</span>
                </div>
                <div class="volume__controls hidden">
                    <div class="volume__slider slider" data-direction="vertical">
                        <div class="volume__progress gap-progress" aria-label="Volume Slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="81" role="slider">
                            <div class="pin volume__pin" data-method="changeVolume"></div>
                        </div>
                    </div>
                </div>
                <span class="message__offscreen">Use Up/Down Arrow keys to increase or decrease volume.</span>
            </div>
            
            <div class="download" >
                <a class="download__link" href="" download="">
                    <svg width="24" height="24" fill="#566574" enable-background="new 0 0 29.978 29.978" version="1.1" viewBox="0 0 29.978 29.978" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
                        <path d="m25.462 19.105v6.848h-20.947v-6.848h-4.026v8.861c0 1.111 0.9 2.012 2.016 2.012h24.967c1.115 0 2.016-0.9 2.016-2.012v-8.861h-4.026z"/>
                        <path d="m14.62 18.426l-5.764-6.965s-0.877-0.828 0.074-0.828 3.248 0 3.248 0 0-0.557 0-1.416v-8.723s-0.129-0.494 0.615-0.494h4.572c0.536 0 0.524 0.416 0.524 0.416v8.742 1.266s1.842 0 2.998 0c1.154 0 0.285 0.867 0.285 0.867s-4.904 6.51-5.588 7.193c-0.492 0.495-0.964-0.058-0.964-0.058z"/>
                    </svg>
                </a>
            </div>
        `;
    }

    initEvents() {
        const p = 0;
        const self = this;

        self.audioPlayer.addEventListener('mousedown', (event) => {
            if (self.isDraggable(event.target)) {
                self.currentlyDragged = event.target;
                const handleMethod = self.currentlyDragged.dataset.method;
                if (handleMethod === 'rewind' && self.player.paused === false) {
                    GreenAudioPlayer.pausePlayer(self.player, 'rewind');
                    self.p = 1;
                }
                const listener = self[handleMethod].bind(self);

                window.addEventListener('mousemove', listener, false);
                window.addEventListener('mouseup', () => {
                    if (self.p > 0) {
                        GreenAudioPlayer.playPlayer(self.player);
                        self.p = 0;
                    }
                    self.currentlyDragged = false;
                    window.removeEventListener('mousemove', listener, false);
                }, false);
            }
        });

        // for mobile touches
        self.audioPlayer.addEventListener('touchstart', (event) => {
            if (self.isDraggable(event.target)) {
                [self.currentlyDragged] = event.targetTouches;

                const handleMethod = self.currentlyDragged.target.dataset.method;
                if (handleMethod === 'rewind' && self.player.paused === false) {
                    GreenAudioPlayer.pausePlayer(self.player, 'rewind');
                    self.p = 1;
                }
                const listener = self[handleMethod].bind(self);

                window.addEventListener('touchmove', listener, false);
                window.addEventListener('touchend', () => {
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
        this.player.addEventListener('loadedmetadata', () => {
            this.totalTime.textContent = GreenAudioPlayer.formatTime(self.player.duration);
        });
        window.addEventListener('keydown', this.pressKb.bind(self), false);
        this.player.addEventListener('seeking', this.showLoadingIndicator.bind(self));
        this.player.addEventListener('seeked', this.hideLoadingIndicator.bind(self));
        this.player.addEventListener('canplay', this.hideLoadingIndicator.bind(self));
        this.player.addEventListener('ended', () => {
            GreenAudioPlayer.pausePlayer(self.player, 'ended');
            self.player.currentTime = 0;
            self.playPauseBtn.setAttribute('aria-label', 'Play');
        });

        window.addEventListener('resize', self.directionAware.bind(self));
        window.addEventListener('scroll', self.directionAware.bind(self));
        this.volumeBtn.addEventListener('click', this.showhideVolume.bind(self));

        for (let i = 0; i < this.sliders.length; i++) {
            const pin = this.sliders[i].querySelector('.pin');
            this.sliders[i].addEventListener('click', self[pin.dataset.method].bind(self));
        }

        this.downloadLink.addEventListener('click', this.downloadAudio.bind(self));
    }

    overcomeIosLimitations() {
        const self = this;
        if (is_device) {
            // iOS and Android devices do not support "canplay" event
            this.player.addEventListener('loadedmetadata', this.hideLoadingIndicator.bind(self));
            // iOS and Android devices do not let "volume" property be set programmatically
            this.audioPlayer.querySelector('.volume').style.display = 'none';
            this.audioPlayer.querySelector('.controls').style.marginRight = '0';
        }
    }

    isDraggable(el) {
        let canDrag = false;

        if (typeof el.classList === 'undefined') return false; // fix for IE 11 not supporting classList on SVG elements

        for (let i = 0; i < this.draggableClasses.length; i++) {
            if (el.classList.contains(this.draggableClasses[i])) {
                canDrag = true;
            }
        }

        return canDrag;
    }

    inRange(event) {
        const touch = ('touches' in event); // instanceof TouchEvent may also be used
        const rangeBox = this.getRangeBox(event);
        const sliderPositionAndDimensions = rangeBox.getBoundingClientRect();
        const { dataset: { direction } } = rangeBox;
        let min = null;
        let max = null;

        if (direction === 'horizontal') {
            min = sliderPositionAndDimensions.x;
            max = min + sliderPositionAndDimensions.width;
            const clientX = touch ? event.touches[0].clientX : event.clientX;
            if (clientX < min || clientX > max) return false;
        } else {
            min = sliderPositionAndDimensions.top;
            max = min + sliderPositionAndDimensions.height;
            const clientY = touch ? event.touches[0].clientY : event.clientY;
            if (clientY < min || clientY > max) return false;
        }
        return true;
    }

    updateProgress() {
        const current = this.player.currentTime;
        const percent = (current / this.player.duration) * 100;
        this.progress.setAttribute('aria-valuenow', percent);
        this.progress.style.width = `${percent}%`;

        this.currentTime.textContent = GreenAudioPlayer.formatTime(current);
    }

    updateVolume() {
        this.volumeProgress.setAttribute('aria-valuenow', this.player.volume * 100);
        this.volumeProgress.style.height = `${this.player.volume * 100}%`;
        if (this.player.volume >= 0.5) {
            this.speaker.attributes.d.value = 'M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z';
        } else if (this.player.volume < 0.5 && this.player.volume > 0.05) {
            this.speaker.attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667M17.333 11.373C17.333 9.013 16 6.987 14 6v10.707c2-.947 3.333-2.987 3.333-5.334z';
        } else if (this.player.volume <= 0.05) {
            this.speaker.attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667';
        }
    }

    getRangeBox(event) {
        let rangeBox = event.target;
        const el = this.currentlyDragged;
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


    getCoefficient(event) {
        const touch = ('touches' in event); // instanceof TouchEvent may also be used

        const slider = this.getRangeBox(event);
        const sliderPositionAndDimensions = slider.getBoundingClientRect();
        let K = 0;
        if (slider.dataset.direction === 'horizontal') {
            // if event is touch
            const clientX = touch ? event.touches[0].clientX : event.clientX;
            const offsetX = clientX - sliderPositionAndDimensions.left;
            const { width } = sliderPositionAndDimensions;
            K = offsetX / width;
        } else if (slider.dataset.direction === 'vertical') {
            const { height } = sliderPositionAndDimensions;
            const clientY = touch ? event.touches[0].clientY : event.clientY;
            const offsetY = clientY - sliderPositionAndDimensions.top;
            K = 1 - offsetY / height;
        }
        return K;
    }

    rewind(event) {
        if (this.inRange(event)) {
            this.player.currentTime = this.player.duration * this.getCoefficient(event);
        }
    }
    showVolume() {
      if (this.volumeBtn.getAttribute('aria-label') === 'Open') {
        this.volumeControls.classList.remove('hidden');
        this.volumeBtn.setAttribute('aria-label', 'Close');
      }
    }
    showhideVolume() {
      this.volumeBtn.classList.toggle('open');
      this.volumeControls.classList.toggle('hidden');
	  
      if (this.volumeBtn.getAttribute('aria-label') === 'Open') {
        this.volumeBtn.setAttribute('aria-label', 'Close');
      } else {
        this.volumeBtn.setAttribute('aria-label', 'Open');
      }
    }
    changeVolume(event) {
        if (this.inRange(event)) {
            this.player.volume = Math.round(this.getCoefficient(event) * 50) / 50;
        }
    }

    static formatTime(time) {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${(min < 10) ? `0${min}` : min}:${(sec < 10) ? `0${sec}` : sec}`;
    }

    togglePlay() {
        if (this.player.paused) {
            if (this.stopOthersOnPlay) {
               GreenAudioPlayer.stopOtherPlayers();
            }
            GreenAudioPlayer.playPlayer(this.player);
            this.playPauseBtn.setAttribute('aria-label', 'Pause');
        } else {
            GreenAudioPlayer.pausePlayer(this.player, 'toggle');
            this.playPauseBtn.setAttribute('aria-label', 'Play');
        }
    }

    setCurrentTime(time) {
        const pos = this.player.currentTime;
        const end = Math.floor(this.player.duration);
        if (pos + time < 0 && pos === 0) {
            return;
        } else if (pos + time < 0) {
            this.player.currentTime = 0;
        } else if (pos + time > end) {
            this.player.currentTime = end;
        } else {
            this.player.currentTime += time;
        }
    }

    setVolume(volume) {
        if (is_device) return;
        const vol = this.player.volume;
        if (vol + volume >= 0 && vol + volume < 1) {
            this.player.volume += volume;
        } else if (vol + volume <= 0) {
            this.player.volume = 0;
        } else {
            this.player.volume = 1;
        }
    }

    pressKb(evt) {
        evt = evt || window.event;
        if (!this.stopOthersOnPlay) {
            switch (evt.keyCode) {
                case 13: this.showhideVolume(); break;
                case 32: this.togglePlay(); break;
                case 37: this.setCurrentTime(-5); break;
                case 39: this.setCurrentTime(5); break;
                case 38: this.showVolume(); this.setVolume(0.05); break;
                case 40: this.showVolume(); this.setVolume(-0.05); break;
            }
        }
    }

    static pausePlayer(player, state) {
        const playPauseButton = player.parentElement.querySelector('.play-pause-btn__icon');
        playPauseButton.attributes.d.value = 'M18 12L0 24V0';
        player.pause();
    }

    static playPlayer(player) {
        const playPauseButton = player.parentElement.querySelector('.play-pause-btn__icon');
        playPauseButton.attributes.d.value = 'M0 0h6v24H0zM12 0h6v24h-6z';
        player.play();
    }

    static stopOtherPlayers() {
        const players = document.querySelectorAll('.green-audio-player audio');

        for (let i = 0; i < players.length; i++) {
            GreenAudioPlayer.pausePlayer(players[i]);
        }
    }

    showLoadingIndicator() {
        this.loading.style.display = 'block';
    }

    hideLoadingIndicator() {
        this.loading.style.display = 'none';
    }

    showDownload() {
        this.download.style.display = 'block';
    }

    downloadAudio() {
        const src = this.player.currentSrc;
        const name = src.split('/').reverse()[0];

        this.downloadLink.setAttribute('href', src);
        this.downloadLink.setAttribute('download', name);
    }

    directionAware() {
        this.volumeControls.classList.remove('top', 'middle', 'bottom');

        if (window.innerHeight < 250) {
            this.volumeControls.classList.add('middle');
        } else if (this.audioPlayer.getBoundingClientRect().top < 180) {
            this.volumeControls.classList.add('bottom');
        } else {
            this.volumeControls.classList.add('top');
        }
    }
}

export default GreenAudioPlayer;
