class MusicManager {
  constructor() {
    this.intro = new Audio("./assets/audio/MapMusicIntro.mp3");
    this.loop = new Audio("./assets/audio/MapMusicLoop.mp3");

    this.intro.preload = "auto";
    this.loop.preload = "auto";

    this.intro.volume = 0.6;
    this.loop.volume = 0.6;

    this.intro.loop = false;
    this.loop.loop = true;

    this.isPausedByUser = false;
    this.currentTrack = null;
    this.playingMapMusic = false;

    this.intro.addEventListener("ended", () => {
      if (!this.isPausedByUser && this.playingMapMusic) {
        if (DEBUG.music) console.log("Switching to loop");
        this.startLoop();
      }
    });
  }

  playMenuMusic() {
    if (DEBUG.music) console.log("Playing Menu Music (Intro)");

    this.playingMapMusic = false;
    this.loop.pause();
    this.loop.currentTime = 0;

    this.intro.pause();
    this.intro.currentTime = 0;
    this.intro.loop = true;

    this.currentTrack = this.intro;

    if (!this.isPausedByUser) {
      this.intro.play().catch(e => {
        if (DEBUG.music) console.log("Intro blocked:", e);
      });
    }
  }

  playMapMusic() {
    if (DEBUG.music) console.log("Playing Map Music (Intro to Loop)");

    this.playingMapMusic = true;

    this.loop.pause();
    this.loop.currentTime = 0;

    this.intro.pause();
    this.intro.currentTime = 0;
    this.intro.loop = false;

    this.currentTrack = this.intro;
    

    if (!this.isPausedByUser) {
      this.intro.play().catch(e => {
        if (DEBUG.music) console.log("Intro blocked:", e);
      });
    }
  }

  startLoop() {
    this.intro.pause();
    this.loop.currentTime = 0;
    this.currentTrack = this.loop;

    if (!this.isPausedByUser) {
      this.loop.play().catch(e => {
        if (DEBUG.music) console.log("Loop blocked", e);
      });
    }
  }

  toggle() {
    this.isPausedByUser = !this.isPausedByUser;

    if (DEBUG.music) console.log("Music toggled. Paused:", this.isPausedByUser);

    if (this.isPausedByUser) {
      if (this.currentTrack) this.currentTrack.pause();
    } else {
      if (this.currentTrack) {
        this.currentTrack.play().catch(e => {
          if (DEBUG.music) console.log("Resume blocked:", e);
        });
      }
    }

    return this.isPausedByUser;
  }

  stop() {
    this.intro.pause();
    this.loop.pause();
    this.intro.currentTime = 0;
    this.loop.currentTime = 0;
    this.currentTrack = null;
    this.playingMapMusic = false;
  }
}