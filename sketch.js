var myCanvas;
let originalMap;
let zeros;
var bubbles = [];
var bubbleDimensions = [];
var bubbleMovements = [];
var indexCounter = 0;
var nextFrames = [];
var currentFrames = [];
var virtualHeight;
var virtualWidth;
var minRadius = 24;
var maxRadius = 40;
var averageRadius;
var topSpeed = 15;
var numberOfBubbles = 10;
var avefr = 10;
var avect = 0;
var aveft = 0;
var img;
var batchSize = 12;
var lastFrameTime = 0;
var fps = 24;

 
function setup() {
  myCanvas = createCanvas(1920, 1080);
  virtualHeight = canvas.height;
  virtualWidth = canvas.width;
  ellipseMode(RADIUS);
  for (let i = 0; i < numberOfBubbles; i++) {
    let br = random(minRadius, maxRadius),
      by = random(0 + br, virtualHeight - br),
      bx = random(0 + br, virtualWidth - br);
    bubbles[i] = new Bubble(bx, by, br); 
  }
  stroke(0);
  strokeWeight(3);
  fill(255);
  textSize(20);
  img = createGraphics(canvas.width,canvas.height);
  originalMap = (makeScreenTensor(img.width, img.height));
  zeros = tf.zeros([img.height, img.width]);
  bubbleMovements = [];
  nextFrames = null;
  for (let i = 0;i<batchSize;i++){
    simulateTimeStep();
    bubbleMovements.push(bubbleDimensions.map(x=>[[[x[0],x[1]]]]));
  }
  metaball();
}

function draw() {
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
      case batchSize-1:
        nextFrames = null;
        metaball();
        break;
    }
    bufferMapper();
    indexCounter++;
  }
  image(img, 0, 0, virtualWidth, virtualHeight);
  avefr = (30 * avefr + 1 * frameRate()) / 31;
  text("" + round(avefr * 5) / 5, 30, height - 30);
}

function makeScreenTensor(w,h){
  let g = new Float32Array(w*h*2);
  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      g[2*i*w+2*j]=j;
      g[2*i*w+2*j+1]=i;
    }
  }
  return tf.tensor(g,[h,w,2]);
}

async function mapBubbles(){
  let cst = millis();
  let bubrs = tf.tensor(bubbleDimensions.map(x=>[[x[2]]]));
  let frameList = [];
  for (let i=0,end=bubbleMovements.length;i<end;i++){
    let scratch =  tf.tidy(_=>{
      let bubs = tf.tensor(bubbleMovements[i]);
      let total = bubrs.mul(tf.squaredDifference(originalMap, bubs).sum(3).sqrt().reciprocal()).sum(0);
      total = tf.clipByValue(total, 0, 3);
      let mn = total.min().asScalar();
      let mx = total.max().asScalar();
      let scl = mx.div(mx.sub(mn));
      total = scl.mul(total.sub(mn).div(mx));
      return total;
    });
      // frameList.push(total);
    frameList.push(scratch);
  }
    // return tf.stack(frameList);
  let scratch = tf.stack(frameList);
  let fst = millis();
  let ret = await scratch.data();
  aveft = (aveft + (millis()-fst))*0.5;
  // console.log(scratch);
  scratch.dispose();
  for (let t of frameList) t.dispose();
  bubrs.dispose();
  avect = (avect + (millis()-cst))*0.5;
  return ret;
}
  
async function metaball() {
  nextFrames = await mapBubbles();
  // bufferMapper(mmbuff);
}

function bufferMapper(distanceMap){
  var buf = new ArrayBuffer(img.width*img.height*4);
  var buf8 = new Uint8ClampedArray(buf);
  var colormap = new Uint32Array(buf);
  let offset = indexCounter*colormap.length;
  for (let idx = 0, end=colormap.length; idx < end; idx++) {
    colormap[idx] = hToRgb32(currentFrames[offset+idx]);    
  }
  img.drawingContext.putImageData(new ImageData(buf8,img.width,img.height),0,0);
}

function simulateTimeStep() {
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].move();
  }
}
