class GreenAudioPlayer {
    constructor(player) {
        this.audioPlayer = document.querySelector(player);

        const audioElement = this.audioPlayer.innerHTML;
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

    static getTemplate() {
        return `
            <div class="loading">
                <div class="loading__spinner"></div>
            </div>
            <div class="play-pause-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
                    <path fill="#566574" fill-rule="evenodd" d="M18 12L0 24V0" class="play-pause-btn__icon"/>
                </svg>
            </div>
    
            <div class="controls">
                <span class="controls__current-time">0:00</span>
                <div class="controls__slider slider" data-direction="horizontal">
                    <div class="controls__progress progress">
                        <div class="pin progress__pin" data-method="rewind"></div>
                    </div>
                </div>
                <span class="controls__total-time">0:00</span>
            </div>
    
            <div class="volume">
                <div class="volume__button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path class="volume__speaker" fill="#566574" fill-rule="evenodd" d="M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z"/>
                    </svg>
                </div>
                <div class="volume__controls hidden">
                    <div class="volume__slider slider" data-direction="vertical">
                        <div class="volume__progress progress">
                            <div class="pin volume__pin" data-method="changeVolume"></div>
                        </div>
                    </div>
                </div>
            </div>
            
        `;
    }

    initEvents() {
        const self = this;

        self.audioPlayer.addEventListener('mousedown', (event) => {
            if (self.isDraggable(event.target)) {
                self.currentlyDragged = event.target;
                const handleMethod = self.currentlyDragged.dataset.method;
                const listener = self[handleMethod].bind(self);

                window.addEventListener('mousemove', listener, false);
                window.addEventListener('mouseup', () => {
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
                const listener = self[handleMethod].bind(self);

                window.addEventListener('touchmove', listener, false);
                window.addEventListener('touchend', () => {
                    self.currentlyDragged = false;
                    window.removeEventListener('touchmove', listener, false);
                }, false);

                event.preventDefault();
            }
        });

        this.playPauseBtn.addEventListener('click', this.togglePlay.bind(self));
        this.player.addEventListener('timeupdate', this.updateProgress.bind(self));
        this.player.addEventListener('volumechange', this.updateVolume.bind(self));
        this.player.addEventListener('loadedmetadata', () => {
            this.totalTime.textContent = GreenAudioPlayer.formatTime(self.player.duration);
        });

        this.player.addEventListener('seeking', this.showLoadingIndicator.bind(self));
        this.player.addEventListener('canplay', this.hideLoadingIndicator.bind(self));
        this.player.addEventListener('ended', () => {
            self.playPause.attributes.d.value = 'M18 12L0 24V0';
            self.player.currentTime = 0;
        });

        this.volumeBtn.addEventListener('click', () => {
            self.volumeBtn.classList.toggle('open');
            self.volumeControls.classList.toggle('hidden');
        });

        window.addEventListener('resize', self.directionAware.bind(self));
        window.addEventListener('scroll', self.directionAware.bind(self));

        this.sliders.forEach((slider) => {
            const pin = slider.querySelector('.pin');
            slider.addEventListener('click', self[pin.dataset.method].bind(self));
        });
    }

    isDraggable(el) {
        let canDrag = false;
        const classes = Array.from(el.classList);
        this.draggableClasses.forEach((draggable) => {
            if (classes.indexOf(draggable) !== -1) {
                canDrag = true;
            }
        });
        return canDrag;
    }

    inRange(event) {
        const touch = ('touches' in event); // instanceof TouchEvent may also be used
        const rangeBox = this.getRangeBox(event);
        const rect = rangeBox.getBoundingClientRect();
        const { dataset: { direction } } = rangeBox;
        let min = null;
        let max = null;

        if (direction === 'horizontal') {
            min = rangeBox.offsetLeft;
            max = min + rangeBox.offsetWidth;
            const clientX = touch ? event.touches[0].clientX : event.clientX;
            if (clientX < min || clientX > max) return false;
        } else {
            min = rect.top;
            max = min + rangeBox.offsetHeight;
            const clientY = touch ? event.touches[0].clientY : event.clientY;
            if (clientY < min || clientY > max) return false;
        }
        return true;
    }

    updateProgress() {
        const current = this.player.currentTime;
        const percent = (current / this.player.duration) * 100;
        this.progress.style.width = `${percent}%`;

        this.currentTime.textContent = GreenAudioPlayer.formatTime(current);
    }

    updateVolume() {
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
        let el = this.currentlyDragged;
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
        const rect = slider.getBoundingClientRect();
        let K = 0;
        if (slider.dataset.direction === 'horizontal') {
            // if event is touch
            const clientX = touch ? event.touches[0].clientX : event.clientX;
            const offsetX = clientX - slider.offsetLeft;
            const width = slider.clientWidth;
            K = offsetX / width;
        } else if (slider.dataset.direction === 'vertical') {
            const height = slider.clientHeight;
            const clientY = touch ? event.touches[0].clientY : event.clientY;
            const offsetY = clientY - rect.top;
            K = 1 - offsetY / height;
        }
        return K;
    }

    rewind(event) {
        if (this.inRange(event)) {
            this.player.currentTime = this.player.duration * this.getCoefficient(event);
        }
    }

    changeVolume(event) {
        if (this.inRange(event)) {
            this.player.volume = Math.round(this.getCoefficient(event) * 10) / 10;
        }
    }

    static formatTime(time) {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${(sec < 10) ? `0${sec}` : sec}`;
    }

    togglePlay() {
        if (this.player.paused) {
            this.playPause.attributes.d.value = 'M0 0h6v24H0zM12 0h6v24h-6z';
            this.player.play();
        } else {
            this.playPause.attributes.d.value = 'M18 12L0 24V0';
            this.player.pause();
        }
    }

    showLoadingIndicator() {
        this.playPauseBtn.style.display = 'none';
        this.loading.style.display = 'block';
    }

    hideLoadingIndicator() {
        this.playPauseBtn.style.display = 'block';
        this.loading.style.display = 'none';
    }

    directionAware() {
        this.volumeControls.classList.remove('top', 'middle', 'bottom');

        if (window.innerHeight < 250) {
            this.volumeControls.classList.add('middle');
        } else if (this.audioPlayer.getBoundingClientRect().top < 154) {
            this.volumeControls.classList.add('bottom');
        } else {
            this.volumeControls.classList.add('top');
        }
    }
}

window.GreenAudioPlayer = GreenAudioPlayer;
