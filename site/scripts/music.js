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

    this.intro.volume = 0.6;
    this.loop.volume = 0.6;

    this.started = false;

    this.loop.addEventListener("timeupdate", () => {
        if (this.loop.currentTime >= this.loop.duration - 0.02) {
            this.loop.currentTime = 0;
            this.loop.play();
        }
    });

    this.intro.addEventListener("ended", () => {
        this.loop.currentTime = 0;
        this.loop.play();
    });
  }

  play() {
    if (this.started) return;
    this.started = true;
    this.intro.currentTime = 0;
    this.intro.play();
    if (DEBUG.other) console.log("Music started");
  }

  stop() {
    this.started = false;
    this.intro.pause();
    this.loop.pause();
    this.intro.currentTime = 0;
    this.loop.currentTime = 0;
  }
}
