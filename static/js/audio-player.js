/**
 * Audio Player with Media Session API
 * Enables background playback controls and system integration
 */

class AudioPlayer {
    constructor(audioElement) {
        this.audio = audioElement;
        this.init();
    }
    
    init() {
        this.setupKeyboardShortcuts();
        this.initMediaSession();
        console.log('✓ Audio Player initialized with Media Session');
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;

            switch(e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    this.audio.paused ? this.audio.play() : this.audio.pause();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    this.audio.currentTime = Math.max(0, this.audio.currentTime - 5);
                    break;
                case 'arrowright':
                    e.preventDefault();
                    this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 5);
                    break;
                case 'arrowup':
                    e.preventDefault();
                    this.audio.volume = Math.min(1, this.audio.volume + 0.1);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    this.audio.volume = Math.max(0, this.audio.volume - 0.1);
                    break;
                case 'm':
                    e.preventDefault();
                    this.audio.muted = !this.audio.muted();
                    break;
            }
        });
    }
    
    initMediaSession() {
        if (!('mediaSession' in navigator)) {
            console.log('ℹ Media Session API not supported');
            return;
        }
        
        console.log('→ Initializing Media Session for audio');
        
        // Get track info from page
        const titleElement = document.querySelector('.title-chip strong');
        const fileName = document.querySelector('.title-chip')?.textContent?.replace('Now playing:', '').trim() || 'Audio Track';
        
        // Set metadata for system controls
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: fileName,
                artist: 'Local Media Server',
                album: 'Media Library',
                artwork: [
                    { src: '/static/favicon.svg', sizes: '96x96', type: 'image/svg+xml' }
                ]
            });
            
            // Action handlers for system media controls
            navigator.mediaSession.setActionHandler('play', () => {
                this.audio.play();
                console.log('Media Session: Play');
            });
            
            navigator.mediaSession.setActionHandler('pause', () => {
                this.audio.pause();
                console.log('Media Session: Pause');
            });
            
            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const skipTime = details.seekOffset || 10;
                this.audio.currentTime = Math.max(0, this.audio.currentTime - skipTime);
            });
            
            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const skipTime = details.seekOffset || 10;
                this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + skipTime);
            });
            
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime !== null) {
                    this.audio.currentTime = details.seekTime;
                }
            });
            
            // Update playback state
            this.audio.addEventListener('play', () => {
                navigator.mediaSession.playbackState = 'playing';
            });
            
            this.audio.addEventListener('pause', () => {
                navigator.mediaSession.playbackState = 'paused';
            });
            
            this.audio.addEventListener('ended', () => {
                navigator.mediaSession.playbackState = 'none';
            });
            
            // Update position state for seekbar in notifications
            this.audio.addEventListener('timeupdate', () => {
                if ('setPositionState' in navigator.mediaSession) {
                    navigator.mediaSession.setPositionState({
                        duration: this.audio.duration || 0,
                        playbackRate: this.audio.playbackRate,
                        position: this.audio.currentTime
                    });
                }
            });
            
            console.log('✓ Media Session enabled - Control from notifications/lock screen!');
        } catch (error) {
            console.error('Media Session error:', error);
        }
    }
}

// Initialize
const audioElement = document.getElementById('main-audio');
if (audioElement) {
    window.audioPlayer = new AudioPlayer(audioElement);
}
