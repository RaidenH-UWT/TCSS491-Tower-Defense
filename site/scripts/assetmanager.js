class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.downloadQueue = [];
    };

    queueDownload(path) {
        if (DEBUG.load) console.log("Queueing " + path);
        this.downloadQueue.push(path);
    };

    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    };

    downloadAll(callback) {
        if (this.downloadQueue.length === 0) setTimeout(callback, 10);
        for (let i = 0; i < this.downloadQueue.length; i++) {
            const path = this.downloadQueue[i];
            if (DEBUG.load) console.log(path);
            
            // different logic if the asset is JSON data or an image
            if (path.slice(-5) == ".json") {
                fetch(path)
                    .then((response) => response.json())
                    .then((json) => {
                        this.cache[path] = json;
                        this.successCount++;
                        if (DEBUG.load) console.log("Loaded " + json.name);
                        if (this.isDone()) callback();
                    });
            } else {
                const img = new Image();
                
                
                img.addEventListener("load", () => {
                    if (DEBUG.load) console.log("Loaded " + img.src);
                    this.successCount++;
                    if (this.isDone()) callback();
                });
                    
                img.addEventListener("error", () => {
                    if (DEBUG.error) console.log("Error loading " + img.src);
                    this.errorCount++;
                    if (this.isDone()) callback();
                });
                    
                img.src = path;
                this.cache[path] = img;
            }
            
        }
    };

    getAsset(path) {
        return this.cache[path];
    };
};

