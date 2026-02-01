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
    constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop, rotation = 0, loopStart = 0, loopEnd = frameCount) {
        Object.assign(this, { spritesheet, xStart, yStart, height, width, frameCount, frameDuration, framePadding, reverse, loop, rotation, loopStart, loopEnd});
        if (this.loop) {
            this.loopStart = loopStart;
            this.loopEnd = loopEnd;
        }
        
        
        this.elapsedTime = 0;
        this.totalTime = this.frameCount * this.frameDuration;
        
    };
    
    drawFrame(tick, ctx, x, y, scale, rotation = this.rotation) {
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
        
        // rotate the frame (video #26)
        let newCanvas = document.createElement("canvas");
        newCanvas.width = this.width;
        newCanvas.height = this.height;
        
        let newContext = newCanvas.getContext("2d");
        
        newContext.save();
        
        newContext.translate(this.width / 2, this.height / 2);
        newContext.rotate(rotation);
        newContext.translate(-this.width / 2, -this.height / 2);
        newContext.drawImage(this.spritesheet, this.xStart + frame * (this.width + this.framePadding), this.yStart, this.width, this.height, 0, 0, this.width, this.height);
        
        newContext.restore();
        
        ctx.drawImage(newCanvas, x, y, this.width * scale, this.height * scale);
                
        if (DEBUG.other) {
            ctx.strokeStyle = '#00FF00';
            ctx.strokeRect(x, y, this.width * scale, this.height * scale);
        }
    };
    
    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    };
    
    isDone() {
        return (this.elapsedTime >= this.totalTime);
    };
    
    reset() {
        this.elapsedTime = 0;
    }
};