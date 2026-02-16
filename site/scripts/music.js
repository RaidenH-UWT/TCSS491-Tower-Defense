/*
    TODO: Fix music pausing for half a second when MapMusicIntro goes to MapMusicLoop
    and when MapMusicLoop loops back again. (0.1-0.5 second pause)
*/
class MusicManager {
  constructor() {
    this.intro = new Audio("./assets/audio/MapMusicIntro.mp3");
    this.loop = new Audio("./assets/audio/MapMusicLoop.mp3");

    // preload
    this.intro.preload = "auto";
    this.loop.preload = "auto";

    this.intro.loop = true; 
    this.loop.loop = true;

    this.intro.volume = 0.6;
    this.loop.volume = 0.6;

    this.started = false;
    this.isPaused = false;
    this.currentTrack = this.intro;
  }

  playIntro() {
    this.stopAll();
    this.currentTrack = this.intro;
    // TODO: make these logs conditional, probably on a DEBUG variable
    if (!this.isPausedByUser) {
        this.intro.play().catch(e => console.log("Waiting for user click..."));
    }
  }

  playLoop(){
    this.stopAll();
    this.currentTrack = this.loop;
    if (!this.isPausedByUser) {
        this.loop.play().catch(e => console.log("Waiting for user click..."));
    }
  }

  toggle() {
    this.isPausedByUser = !this.isPausedByUser; 

    if (this.isPausedByUser) {
        this.currentTrack.pause();
    } else {
        this.currentTrack.play().catch(e => console.log(e));
    }
    
    return this.isPausedByUser;
  }

  stopAll() {
    this.intro.pause();
    this.loop.pause();
    this.intro.currentTime = 0;
    this.loop.currentTime = 0;
  }
  stop() {
    this.started = false;
    this.stopAll();
  }
}
