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
