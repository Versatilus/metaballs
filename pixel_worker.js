function colorPixelFromBubble(bubble, x, y) {
    var pixelColor = 0.5 * bubble[2] / ((Math.abs(bubble[0] - x) + Math.abs(
    bubble[1] - y)) + 1);
  return pixelColor += bubble[2] / (Math.sqrt(Math.pow(bubble[0] - x, 2) +
    Math.pow(bubble[1] - y, 2)) + 1);
}

function colorRow(env){
    let XScaleFactor = env.XScaleFactor;
    let y = env.y;
    let lineLength = env.lineLength;
    let bubbles = env.bubbles;
    let rowBuffer = new ArrayBuffer(lineLength);
    for(var x=0;x<lineLength;++x){
	let scaledX = x * XScaleFactor;
	let pixelColor = 0;
	let i = bubbles.length;
	while(i--){
	    pixelColor += colorPixelFromBubble(bubbles[i], scaledX, y);
	}
	rowBuffer[x] = pixelColor;
    }
    return rowBuffer;
}

onmessage = function (e) {
  switch (e.data.messageType) {
  case 'applyFunction':
      var callback='colorPixel';
      var env = e.data.environment;
/*    var x = e.data.callbackArguments.x;
    var y = e.data.callbackArguments.y;
    var bubble = e.data.callbackArguments.bubble;
*/
      var id = e.data.callbackArguments.id;
    postMessage({
      'messageType': 'callbackResult',
	'id': id,
	'environment': env,
	'result': colorPixelFromBubble(env)
    });
    break;
  default:
  }
};
/*

mw = new Worker("pixel_worker.js");
mw.onmessage = (e)=>this.newestResponse = e;
mw.postMessage({
  messageType: 'colorPixelRequest',
  callbackArguments: {
    id: 0,
    x: 3,
    y: 4,
    bubble: bubbleDimensions[0],
  }
});console.log(bubbleDimensions[0]);



*/
/*function calculatePixelsFunction() {
  var pixelColor, colorScaler = log(bubbles.length + (maxRadius + minRadius)) * 2,
    currentColorMin = 500012,
    currentColorMax = 0,
    currentColorTotal = 0;
  var idx, x, y, index, scaledX, scaledY;
  var p = new Parallel(bubbles);
  var colormap = [];
  for (y = 0; y < blobGridY; y++) {
    scaledY = y * blobGridYFactor;
    for (x = 0; x < blobGridX; x++) {
      scaledX = x * blobGridXFactor;
      idx = (x + y * blobGridX);
      colormap[idx] = p.map(function colorPixel(bubble) {
          var pc = (bubble.radius + 1) / ((abs(bubble.x - scaledX) + abs(bubble.y - scaledY)) + 0.5);
          pc += (1 + colorScaler * bubble.radius) / (roots[~~((bubble.x - scaledX) ** 2 + (bubble.y - scaledY) ** 2)] + 0.5);
          return pc;
        })
        .reduce(function sum(prev, curr) {
          return prev + curr
        }, 0);
    }
  }
  return colormap;
}
*/


function makeGrid(w,h){
  let g = new Float32Array(w*h*2);
  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      g[2*i*w+2*j]=j;
      g[2*i*w+2*j+1]=i;
    }
  }
  return g;
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

  function mapBubbles(bubbleList){
    return tf.tidy(_=>{
      let total = tf.variable(tf.zeros([h,w]));
      for (let i = 0, end = bubbleList.length;i<end;i++){
        total.assign(total.add((tf.sqrt(tf.sum(tf.squaredDifference(originalMap,
          tf.tensor1d([bubbleList[i][0],bubbleList[i][1]])),2)).reciprocal())));
      }
      return tf.tanh(total).dataSync();
    });
  }
  
function helloWorld() {
  tf.sqrt(tf.sum(s.squaredDifference(tf.tensor1d([3,2])),2)).print();
  
};

function minmax(x){
  let minimum = Infinity;
  let maximum = -Infinity;
  for (let i=0,end=x.length;i<end;i++){
    minimum = Math.min(x[i],minimum);
    maximum = Math.max(x[i],maximum);
  }
  return {minimum, maximum};
 }

  function buildMap(w,h,bubbleList){
    let originalMap = tf.tensor(makeGrid(w,h),[h,w,2]);
    return tf.tidy(_=>{
      let total = tf.variable(tf.zeros([h,w]));
      for (let i = 0, end = bubbleList.length;i<end;i++){
        total.assign(total.add((tf.sqrt(tf.sum(tf.squaredDifference(originalMap,
          tf.tensor1d([bubbleList[i][0],bubbleList[i][1]])),2)).reciprocal())));
      }
      return tf.tanh(total).dataSync();
    });
  }