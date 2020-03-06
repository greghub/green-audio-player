class GreenAudioPlayer {
    constructor(player) {
        this.audioPlayer = document.querySelector(player);

        const audioElement = this.audioPlayer.innerHTML;
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
            const playPauseButton = this.player.parentElement.querySelector('.play-pause-btn__icon');
            playPauseButton.attributes.d.value = 'M7.7 3q0-.4-.3-.7-.3-.3-.7-.3H4.5q-.4 0-.7.3-.3.3-.3.7v14q0 .4.3.7.3.3.7.3h2.2q.4 0 .7-.3.3-.3.3-.7V3zm9.8 0q0-.4-.3-.7-.3-.3-.7-.3h-2.2q-.4 0-.7.3-.3.3-.3.7v14q0 .4.3.7.3.3.7.3h2.2q.4 0 .7-.3.3-.3.3-.7V3z';
        }
    }

    static getTemplate() {
        return `
            <div class="holder">
                <div class="loading">
                    <div class="loading__spinner"></div>
                </div>

                <div class="play-pause-btn" aria-label="Play">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                        <path fill="#008000" fill-rule="nonzero" d="M16.4 10.5q.4-.2.4-.5t-.4-.55L5.05 2.5q-.35-.2-.6-.05-.25.15-.25.55v14q0 .4.25.55.25.15.6-.1L16.4 10.5z" class="play-pause-btn__icon"/>
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
                <div class="volume__button" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                        <path class="volume__speaker" fill="#008000" fill-rule="evenodd" d="M11.85 2.7q-.25-.1-.55.15L7.75 5.5q-.75.6-1.8.6H2.8q-1 0-1 1v5.75q0 1 1 1h3.15q1 0 1 .05l4.35 3.2q.3.25.55.15.25-.15.25-.55V3.25q0-.4-.25-.55z"/>
                        <path class="volume__speaker-one" stroke="#008000" stroke-width="1.5" stroke-linecap="round" fill="none" d="M13.35 6.1h.4l.55.15.65.4q1 1 1 3.35-.05 2.1-.85 3.05-.15.2-.7.6l-.65.2h-.4"/>
                        <path class="volume__speaker-two" stroke="#008000" stroke-width="1.5" stroke-linecap="round" fill="none" d="M14.65 2.25h.4l.75.15q1.1.5 1.7 1.7 1.05 2.05 1 5.9 0 3.4-.9 5.45-.65 1.6-1.75 2.05-.35.2-.7.2h-.5"/>
                        <path class="volume__speaker-three" stroke="none" stroke-width="1.5" stroke-linecap="round" fill="none" d="M13.35 7.25l5.4 5.4m-5.4 0l5.4-5.4"/>
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
        `;
    }

    initEvents() {
        this.p = 0;
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

        this.volumeBtn.addEventListener('click', this.showhideVolume.bind(self));

        for (let i = 0; i < this.sliders.length; i++) {
            const pin = this.sliders[i].querySelector('.pin');
            this.sliders[i].addEventListener('click', self[pin.dataset.method].bind(self));
        }
    }

    overcomeIosLimitations() {
        const self = this;
        if (this.isDevice) {
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
        if (this.volumeBtn.getAttribute('aria-label') === 'Close') {
            this.volumeControls.classList.remove('hidden');
            this.volumeBtn.setAttribute('aria-label', 'Open');
        }
    }

    showhideVolume() {
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
            this.player.currentTime = this.player.currentTime;
        } else if (pos + time < 0) {
            this.player.currentTime = 0;
        } else if (pos + time > end) {
            this.player.currentTime = end;
        } else {
            this.player.currentTime += time;
        }
    }

    setVolume(volume) {
        if (this.isDevice) return;
        const vol = this.player.volume;
        if (vol + volume >= 0 && vol + volume < 1) {
            this.player.volume += volume;
        } else if (vol + volume <= 0) {
            this.player.volume = 0;
        } else {
            this.player.volume = 1;
        }
    }

    pressKb(event) {
        const evt = event || window.event;
        switch (evt.keyCode) {
        case 13: this.showhideVolume(); break;
        case 32: this.togglePlay(); break;
        case 37: this.setCurrentTime(-5); break;
        case 39: this.setCurrentTime(5); break;
        case 38: this.showVolume(); this.setVolume(0.05); break;
        case 40: this.showVolume(); this.setVolume(-0.05); break;
        default: break;
        }
    }

    static pausePlayer(player, state) {
        const playPauseButton = player.parentElement.querySelector('.play-pause-btn__icon');
        playPauseButton.attributes.d.value = (state === 'ended') ? 'M18.65 3.75q-.2-.15-.55.05l-6.2 3.6q-.35.2-.35.45t.4.4l4.9 1.8q.35.15.7-.05.35-.15.4-.55l.85-5.15q.05-.4-.15-.55zm-3.55 4.4l2.25.9q-.4-3-2.65-5-2.3-2-5.4-2-3.35 0-5.7 2.35Q1.2 6.75 1.2 10q0 2.2 1.15 4.1 1.15 1.9 3.1 2.95 1.8.9 3.85.9 2 0 3.75-.9 1.7-.85 2.8-2.4l-1.8-.95q-1.75 2.25-4.75 2.25-1.5 0-2.9-.7-1.45-.8-2.35-2.2-.85-1.4-.85-3.05 0-2.45 1.8-4.2t4.3-1.75q2 0 3.6 1.15 1.55 1.15 2.2 2.95z' : 'M16.4 10.5q.4-.2.4-.5t-.4-.55L5.05 2.5q-.35-.2-.6-.05-.25.15-.25.55v14q0 .4.25.55.25.15.6-.1L16.4 10.5z';
        player.pause();
    }

    static playPlayer(player) {
        const playPauseButton = player.parentElement.querySelector('.play-pause-btn__icon');
        playPauseButton.attributes.d.value = 'M7.7 3q0-.4-.3-.7-.3-.3-.7-.3H4.5q-.4 0-.7.3-.3.3-.3.7v14q0 .4.3.7.3.3.7.3h2.2q.4 0 .7-.3.3-.3.3-.7V3zm9.8 0q0-.4-.3-.7-.3-.3-.7-.3h-2.2q-.4 0-.7.3-.3.3-.3.7v14q0 .4.3.7.3.3.7.3h2.2q.4 0 .7-.3.3-.3.3-.7V3z';
        player.play();
    }

    showLoadingIndicator() {
        this.loading.style.display = 'block';
    }

    hideLoadingIndicator() {
        this.loading.style.display = 'none';
    }
}

export default GreenAudioPlayer;
