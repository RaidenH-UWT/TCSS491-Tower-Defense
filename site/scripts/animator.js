/**
 * This class handles animating sprites from a spritesheet
 * @param {spritesheet} Image spritesheet to work from
 * @param {xStart} x-coord of the top-left corner of the sprite to use
 * @param {yStart} y-coord of the top-left corner of the sprite to use
 * @param {width} width of one frame of the sprite
 * @param {height} height of one frame of the sprite
 * @param {frameCount} number of frames in the animation
 * @param {frameDuration} length of one frame in [UNITS??]
 * @param {framePadding} gap between each frame
 * @param {reverse} boolean whether to play the animation in reverse
 * @param {loop} boolean whether to loop the animation or not
 * @param {loopStart} required if loop=true, the frame to start the loop on
 * @param {loopEnd} required if loop=true, the frame to end the loop on
 */
class Animator {
    constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop, loopStart = 0, loopEnd = frameCount) {
        Object.assign(this, { spritesheet, xStart, yStart, height, width, frameCount, frameDuration, framePadding, reverse, loop, loopStart, loopEnd});
        if (this.loop) {
            this.loopStart = loopStart;
            this.loopEnd = loopEnd;
        }
        
        
        this.elapsedTime = 0;
        this.totalTime = this.frameCount * this.frameDuration;
        
    };
    
    drawFrame(tick, ctx, x, y, scale) {
        this.elapsedTime += tick;
        
        if (this.isDone()) {
            if (this.loop) {
                this.elapsedTime -= (this.frameDuration * (this.loopEnd - this.loopStart));
            } else {
                if (DEBUG.warn) console.log("WARNING: DRAWING A FRAME FOR A FINISHED ANIMATION");
                if (DEBUG.warn) console.log("   " + this.yStart);
                return;
            }
        }
        
        let frame = this.currentFrame();
        if (this.reverse) frame = this.frameCount - frame - 1;
        
        ctx.drawImage(this.spritesheet,
                      this.xStart + frame * (this.width + this.framePadding), this.yStart, //source from sheet
                      this.width, this.height,
                      x, y,
                      this.width * scale,
                      this.height * scale);
        
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Green';
            ctx.strokeRect(x, y, this.width * scale, this.height * scale);
        }
    };
    
    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    };
    
    isDone() {
        return (this.elapsedTime >= this.totalTime);
    };
    
    isAlmostDone() {
        return this.currentFrame() == this.frameCount - 1;
    }
    
    reset() {
        this.elapsedTime = 0;
    }
};