/**
 * Enhanced Media Player
 * Professional video player with keyboard shortcuts, speed control, and better UX
 */

class MediaPlayer {
    constructor(videoElement) {
        this.video = videoElement;
        this.isPlaying = false;
        this.playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        this.currentRateIndex = 3; // 1x speed
        
        this.init();
    }
    
    init() {
        this.setupKeyboardShortcuts();
        this.setupEventListeners();
        this.createCustomControls();
        console.log('✓ MediaPlayer initialized');
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent shortcuts when typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch(e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                    
                case 'arrowleft':
                    e.preventDefault();
                    this.seek(-5);
                    this.showTemporaryMessage('-5s');
                    break;
                    
                case 'arrowright':
                    e.preventDefault();
                    this.seek(5);
                    this.showTemporaryMessage('+5s');
                    break;
                    
                case 'arrowup':
                    e.preventDefault();
                    this.adjustVolume(0.1);
                    break;
                    
                case 'arrowdown':
                    e.preventDefault();
                    this.adjustVolume(-0.1);
                    break;
                    
                case 'f':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                    
                case 'm':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                    
                case 'p':
                    if (document.pictureInPictureEnabled) {
                        e.preventDefault();
                        this.togglePictureInPicture();
                    }
                    break;
                    
                case '>':
                case '.':
                    e.preventDefault();
                    this.changePlaybackSpeed(1);
                    break;
                    
                case '<':
                case ',':
                    e.preventDefault();
                    this.changePlaybackSpeed(-1);
                    break;
                    
                case '0':
                case 'home':
                    e.preventDefault();
                    this.video.currentTime = 0;
                    this.showTemporaryMessage('Restarted');
                    break;
                    
                case 'end':
                    e.preventDefault();
                    this.video.currentTime = this.video.duration - 5;
                    break;
            }
        });
    }
    
    setupEventListeners() {
        this.video.addEventListener('play', () => {
            this.isPlaying = true;
            console.log('▶ Playing');
        });
        
        this.video.addEventListener('pause', () => {
            this.isPlaying = false;
            console.log('⏸ Paused');
        });
        
        this.video.addEventListener('ended', () => {
            console.log('✓ Playback complete');
        });
        
        this.video.addEventListener('error', (e) => {
            console.error('✗ Video error:', this.video.error);
        });
    }
    
    createCustomControls() {
        // Create speed control indicator
        const speedIndicator = document.createElement('div');
        speedIndicator.id = 'playback-speed-indicator';
        speedIndicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 6px;
            font-size: 0.9rem;
            z-index: 1000;
            display: none;
            backdrop-filter: blur(10px);
        `;
        speedIndicator.textContent = `Speed: ${this.playbackRates[this.currentRateIndex]}x`;
        document.body.appendChild(speedIndicator);
        this.speedIndicator = speedIndicator;
        
        // Create temporary message overlay
        const messageOverlay = document.createElement('div');
        messageOverlay.id = 'player-message-overlay';
        messageOverlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 16px 24px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            border-radius: 8px;
            font-size: 1.2rem;
            font-weight: 500;
            z-index: 9999;
            display: none;
            backdrop-filter: blur(10px);
            pointer-events: none;
        `;
        document.body.appendChild(messageOverlay);
        this.messageOverlay = messageOverlay;
    }
    
    togglePlayPause() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }
    
    seek(seconds) {
        const newTime = Math.max(0, Math.min(this.video.currentTime + seconds, this.video.duration));
        this.video.currentTime = newTime;
    }
    
    adjustVolume(delta) {
        const newVolume = Math.max(0, Math.min(1, this.video.volume + delta));
        this.video.volume = newVolume;
        this.video.muted = false;
        this.showTemporaryMessage(`Volume: ${Math.round(newVolume * 100)}%`);
    }
    
    toggleMute() {
        this.video.muted = !this.video.muted;
        this.showTemporaryMessage(this.video.muted ? 'Muted' : 'Unmuted');
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.video.requestFullscreen().catch(err => {
                console.error('Fullscreen error:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    async togglePictureInPicture() {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                this.showTemporaryMessage('Exited PiP');
            } else {
                await this.video.requestPictureInPicture();
                this.showTemporaryMessage('Picture-in-Picture');
            }
        } catch (err) {
            console.error('PiP error:', err);
        }
    }
    
    changePlaybackSpeed(direction) {
        this.currentRateIndex += direction;
        
        // Wrap around
        if (this.currentRateIndex >= this.playbackRates.length) {
            this.currentRateIndex = 0;
        } else if (this.currentRateIndex < 0) {
            this.currentRateIndex = this.playbackRates.length - 1;
        }
        
        const newRate = this.playbackRates[this.currentRateIndex];
        this.video.playbackRate = newRate;
        
        // Update and show indicator
        this.speedIndicator.textContent = `Speed: ${newRate}x`;
        this.speedIndicator.style.display = 'block';
        
        setTimeout(() => {
            this.speedIndicator.style.display = 'none';
        }, 2000);
        
        console.log(`Playback speed: ${newRate}x`);
    }
    
    showTemporaryMessage(message) {
        this.messageOverlay.textContent = message;
        this.messageOverlay.style.display = 'block';
        
        // Clear any existing timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        // Hide after 1 second
        this.messageTimeout = setTimeout(() => {
            this.messageOverlay.style.display = 'none';
        }, 1000);
    }
    
    initMediaSession() {
        // Check if Media Session API is supported
        if (!('mediaSession' in navigator)) {
            console.log('ℹ Media Session API not supported');
            return;
        }
        
        console.log('→ Initializing Media Session API');
        
        // Set metadata
        const metadata = {
            title: document.querySelector('.title-chip')?.textContent || 'Video',
            artist: 'Local Media Server',
            album: 'Media Library',
        };
        
        try {
            navigator.mediaSession.metadata = new MediaMetadata(metadata);
            
            // Set action handlers for system controls
            navigator.mediaSession.setActionHandler('play', () => {
                this.video.play();
                console.log('Media Session: Play');
            });
            
            navigator.mediaSession.setActionHandler('pause', () => {
                this.video.pause();
                console.log('Media Session: Pause');
            });
            
            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const skipTime = details.seekOffset || 10;
                this.video.currentTime = Math.max(0, this.video.currentTime - skipTime);
                console.log(`Media Session: Seek backward ${skipTime}s`);
            });
            
            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const skipTime = details.seekOffset || 10;
                this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + skipTime);
                console.log(`Media Session: Seek forward ${skipTime}s`);
            });
            
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime !== null) {
                    this.video.currentTime = details.seekTime;
                    console.log(`Media Session: Seek to ${details.seekTime}s`);
                }
            });
            
            // Update playback state
            this.video.addEventListener('play', () => {
                navigator.mediaSession.playbackState = 'playing';
            });
            
            this.video.addEventListener('pause', () => {
                navigator.mediaSession.playbackState = 'paused';
            });
            
            // Update position state
            this.video.addEventListener('timeupdate', () => {
                if ('setPositionState' in navigator.mediaSession) {
                    navigator.mediaSession.setPositionState({
                        duration: this.video.duration,
                        playbackRate: this.video.playbackRate,
                        position: this.video.currentTime
                    });
                }
            });
            
            console.log('✓ Media Session API initialized - System controls enabled');
        } catch (error) {
            console.error('Media Session error:', error);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const videoElement = document.getElementById('main-video');
        if (videoElement) {
            window.mediaPlayer = new MediaPlayer(videoElement);
            // Initialize Media Session after player is ready
            window.mediaPlayer.initMediaSession();
        }
    });
} else {
    const videoElement = document.getElementById('main-video');
    if (videoElement) {
        window.mediaPlayer = new MediaPlayer(videoElement);
        // Initialize Media Session after player is ready
        window.mediaPlayer.initMediaSession();
    }
}
