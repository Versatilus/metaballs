// tl;dr: The math is fast on the GPU, but it takes too much time to get a piece of data
// out of a tensor so that it can be written on an ordinary 2D canvas.
// This should be a lot faster when written with shaders for a 3D canvas.

/// settings
let topSpeed = 15; // Speedy bubbles!
let numberOfBubbles = 15; // The automatic scaling gets weird past 30.
let batchSize = 32; // This has the biggest effect on memory usage.
let fps = 16;

// Implementation globals
let avefr = 10;
let avect = 0;
let aveft = 0;
let img;
let originalMap;
let bubbles = [];
let bubbleDimensions = [];
let bubbleMovements = [];
let indexCounter = 0;
let nextFrames = null;
let currentFrames;
let virtualHeight;
let virtualWidth;
let lastFrameTime = 0;


 
function setup() {
  // Feel free to experiment with this, but watch memory usage!
  createCanvas(640, 360);
  // I'm specific about the source of dimensions when working with an image as a buffer.
  img = createGraphics(canvas.width, canvas.height);
  virtualHeight = canvas.height;
  virtualWidth = canvas.width;
  
  let radiusScale = min(virtualWidth, virtualHeight)/numberOfBubbles;
  let minRadius = radiusScale*0.125;
  let maxRadius = radiusScale*1.5;
  for (let i = 0; i < numberOfBubbles; i++) {
    let br = random(minRadius, maxRadius),
      by = random(virtualHeight),
      bx = random(virtualWidth);
    bubbles[i] = new Bubble(bx, by, br); 
  }
  
  stroke(0);
  strokeWeight(3);
  fill(255);
  textSize(20);
  
  // This creates a [h,w,2] Tensor where each y,x is [x,y]. Frame drawing is based on this.
  originalMap = makeScreenTensor(img.width, img.height);
  
  // Precalculate the first set of frames.
  bubbleMovements = [];
  nextFrames = null;
  for (let i = 0;i < batchSize;i++){
    simulateTimeStep();
    bubbleMovements.push(bubbleDimensions.map(x=>[[[x[0],x[1]]]]));
  }
  metaball();
}

function draw() {
  image(img, 0, 0, virtualWidth, virtualHeight);
  if(nextFrames!==null && millis()-lastFrameTime > 1000/fps){
    lastFrameTime = millis();
    indexCounter = indexCounter % batchSize;
    switch (indexCounter) {
      case 0:
        currentFrames = nextFrames;
        bubbleMovements = [];
        for (let i = 0;i<batchSize;i++){
          simulateTimeStep();
          bubbleMovements.push(bubbleDimensions.map(x=>[[[x[0],x[1]]]]));
        }
        break;
      case 1:
        metaball();
        break;
    }
    bufferMapper();
    indexCounter++;
  }
  avefr = (30 * avefr + 1 * frameRate()) / 31;
  text("" + round(avefr * 5) / 5, 30, height - 30);
}

// This creates a [h,w,2] Tensor where each y,x is [x,y]. Frame drawing is based on this.
function makeScreenTensor(w,h){
  let g = new Float32Array(w*h*2);
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      g[2*i*w+2*j]=j;
      g[2*i*w+2*j+1]=i;
    }
  }
  return tf.tensor(g,[h,w,2]);
}

async function mapBubbles(){
  let cst = millis();
  
  // Technically this can be global, but it's cheap to recompute.
  let bubrs = tf.tensor(bubbleDimensions.map(x=>[[x[2]]]));
  
  let frameList = [];
  
  // Perform all of the calculations for a single frame.
  for (let i=0,end=bubbleMovements.length;i<end;i++){
    let scratch =  tf.tidy(_=>{
      // Breaking this down into single ops allows using `.dispose()` for big mem savings.
      let bubs = tf.tensor(bubbleMovements[i]);
      let distances = tf.squaredDifference(originalMap, bubs).sum(3).sqrt();
      let adjustByRadii = bubrs.mul(distances.reciprocal()).sum(0);
      distances.dispose();
      let subtotal = tf.clipByValue(adjustByRadii, 0, 3);
      adjustByRadii.dispose();
      let mn = subtotal.min().asScalar();
      let mx = subtotal.max().asScalar();
      let scl = mx.div(mx.sub(mn));
      total = scl.mul(subtotal.sub(mn).div(mx));
      return total;
    });
    frameList.push(scratch);
  }
  
  let scratch = tf.stack(frameList);
  let fst = millis();
  let ret = await scratch.data();
  aveft = (aveft + (millis()-fst))*0.5;
  
  scratch.dispose();
  for (let t of frameList) t.dispose();
  bubrs.dispose();
  avect = (avect + (millis()-cst))*0.5;
  
  return ret;
}
  
async function metaball() {
  nextFrames = await mapBubbles();
}

function bufferMapper(distanceMap){
  let buf = new ArrayBuffer(img.width*img.height*4);
  let buf8 = new Uint8ClampedArray(buf);
  let colormap = new Uint32Array(buf);
  
  let offset = indexCounter*colormap.length;
  for (let idx = 0, end=colormap.length; idx < end; idx++) {
    colormap[idx] = hToRgb32(currentFrames[offset+idx]);    
  }
  
  // This was a premature optimization to avoid loading img.pixels.
  img.drawingContext.putImageData(new ImageData(buf8,img.width,img.height),0,0);
}

function simulateTimeStep() {
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].move();
  }
}
