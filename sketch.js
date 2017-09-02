var myCanvas;
var bubbles = [];
var bubbleDimensions = [];
var virtualHeight = 1000;
var virtualWidth = 1000;
var fps = 25;
var mpf = 1000 / fps;
var drawTimes = [mpf];
var lastFrameTime = 0;
var minRadius = 8;
var maxRadius = 32;
var averageRadius;
var topSpeed = 5;
var numberOfBubbles = 5;
var initialColor = [255, 255, 255];
var initialAlpha = 0xBF;
var averageFrameRate = fps;
var recentFrameRates = [];
var innerLoopTimes = [];
var avefr = fps;
var reportTime = 0;
var maxBounces = 0;
var minBounces = 0;
var searchSpace = 2.2 * (maxRadius + topSpeed);
let trackingGrid = [];
let gridX = ~~(virtualWidth / searchSpace);
let gridY = ~~(virtualHeight / searchSpace);
let gridSpanX = virtualWidth / gridX;
let gridSpanY = virtualHeight / gridY;
let triesRecord = [];
var laserBeams = false;
var simulationInterval, reportInterval, blobInterval;
var simulating = true,
  reporting = false;
var img;
var blobGridX;
var blobGridY;
var blobGridXFactor;
var blobGridYFactor;
var blobGridXScale = 2.25;
var blobGridYScale = 2.25;

//var buf8, colormap;
var averageRadius = (maxRadius + minRadius) / 2,
  maxDistance = 1 / (Math.sqrt(virtualWidth ** 2 + virtualHeight ** 2) + 1),
  minColor = averageRadius * maxDistance * bubbles.length;

function calculateBlobGrid(xScale, yScale) {
  blobGridXScale = typeof (xScale) === 'number' ? xScale : typeof (
    blobGridXScale) === 'number' ? blobGridXScale : 1;
  blobGridYScale = typeof (yScale) === 'number' ? yScale : typeof (
    blobGridYScale) === 'number' ? blobGridYScale : 1;
  blobGridX = ~~(gridSpanX * blobGridXScale);
  blobGridY = ~~(gridSpanY * blobGridYScale);
  blobGridXFactor = virtualWidth / blobGridX;
  blobGridYFactor = virtualHeight / blobGridY;
  img = createGraphics(blobGridX, blobGridY);
  averageRadius = (maxRadius + minRadius) / 2,
    maxDistance = 1 / (Math.sqrt(virtualWidth ** 2 + virtualHeight ** 2) + 1),
    minColor = averageRadius * maxDistance * bubbles.length;
}

function preload() {
  //img = loadImage("resources/crack.jpg");
}

function setup() {
  pixelDensity(1);
  myCanvas = createCanvas(windowWidth - 5, windowHeight - 5);
  strokeWeight(3);
  ellipseMode(RADIUS);
  virtualWidth = width;
  virtualHeight = height;
  const bubbleFactor = (~~(virtualWidth / searchSpace)) * (~~(virtualHeight /
    searchSpace));
  numberOfBubbles = bubbleFactor / log(minRadius * 1.88);
  let lts = 0;
  updateGrid();
  for (let i = 0; i < numberOfBubbles; i++) {
    let br = i % (maxRadius - minRadius) + minRadius,
      by = random(0 + br, virtualHeight - br),
      bx = random(0 + br, virtualWidth - br),
      found = 0,
      tries = 0,
      ts;
    while (found !== 1) {
      if (tries === 500) {
        numberOfBubbles = bubbles.length;
        console.log(numberOfBubbles);
        break;
      }
      found = 1;
      let neighborhood = getNeighborhoodFromGrid(bx, by);
      ts = window.performance.now();
      for (var k = 0; k < neighborhood.length; k++) {
        if (dist(bx, by, neighborhood[k].x, neighborhood[k].y) < 1.5 * (br +
            neighborhood[k].radius)) {
          br = i % (maxRadius - minRadius) + minRadius;
          by = random(0 + br, virtualHeight - br);
          bx = random(0 + br, virtualWidth - br);
          found = 0;
          tries++;
          break;
        }
      }
	lts += (window.performance.now() - ts);
    }
    if (found) {
      triesRecord.push(tries);
      bubbles[i] = new Bubble(i, bx, by, br, initialColor, initialAlpha);
      addToGrid2(bubbles[i]);
    }
  }
  //bubbleDimensions = new Float32Array(bubbleDimensions.slice());
  console.log(lts);
  simulationInterval = setInterval(simulateTimeStep, mpf);
  console.log("20170822_114438");
  calculateBlobGrid();
    blobInterval = setInterval(metaball, mpf * 2);
}

function draw() {
    image(img, 0, 0, virtualWidth, virtualHeight, 0, 0, blobGridX, blobGridY);
    /*for (var i = 0; i < bubbles.length; i++) {
      bubbles[i].display();
      }*/
    avefr = (59*avefr+1*frameRate())/60;
    stroke(0);
    strokeWeight(3);
    fill(255);
    textSize(20);
    text(""+round(avefr*5)/5, 30,height-30);
    lastFrameTime = window.performance.now();
}

function updatePixel(x,y, colorValue){
    colormap[x+y*width] += colorValue;
} 

function findBubbleColor(bubble, x, y){
    let XDistance = bubble[0] - x;
    let YDistance = bubble[1] - y;
    let r = bubble[2];
    let pixelColor = 0.325 * r / Math.max((Math.abs(XDistance) + Math.abs(
        YDistance)),0.5);
    pixelColor += 1.55 * r / (Math.max(Math.sqrt(
        Math.pow(XDistance, 2) + Math.pow(YDistance, 2))-r*0.25, 0.75));
    return pixelColor;
}

function colorPixel(x,y){
    let pixelColor = 0;
    let i = bubbles.length;
    while (i--) {
	pixelColor += findBubbleColor(bubbleDimensions[bubbles[i].id], x, y);
    }
    return pixelColor;
}

function metaball() {
  var pixelColor, currentColorMin = 500012,
    currentColorMax = 0;
    var i, x, y, index, scaledX, scaledY, idx;
  img.loadPixels();
  var  buf = new ArrayBuffer(img.pixels.length);
  var buf8 = new Uint8ClampedArray(buf);
  var colormap = new Uint32Array(buf);
  var maxDistance = 1 / (sqrt(virtualWidth ** 2 + virtualHeight ** 2) * 0.5 + 1);
  averageRadius = 0;
  for (i = 0; i < bubbles.length; ++i) averageRadius += bubbles[i].radius;
  averageRadius = (averageRadius / bubbles.length + minRadius) * 0.5;
  minColor = averageRadius * maxDistance * bubbles.length * 0.75;
  for (y = 0; y < blobGridY; y++) {
    scaledY = y * blobGridYFactor;
    for (x = 0; x < blobGridX; x++) {
      scaledX = x * blobGridXFactor;
      pixelColor = 0;
      idx = x + y * blobGridX;
      i = bubbles.length;
      while (i--) {
        let id = bubbles[i].id;
        let XDistance = bubbleDimensions[id][0] - scaledX;
          let YDistance = bubbleDimensions[id][1] - scaledY;
	  let r = bubbleDimensions[id][2];
        pixelColor += 0.325 * r / Math.max((Math.abs(XDistance) + Math.abs(
            YDistance)),0.5);
          pixelColor += 1.55 * r / (Math.max(Math.sqrt(
            Math.pow(XDistance, 2) + Math.pow(YDistance, 2))-r*0.25, 0.75));
      }
	colormap[idx] = hslToRgb32(0.5*pixelColor%1, 1, 0.5, 1);
/*      	colormap[idx] = hslToRgb32(
	   (map(0.45* pixelColor, minColor, minColor *
		    log( maxRadius), 0.79167, 1.75)), 1, 0.5, 1);*/
      //colormap[idx] = hslToRgb32(map(0.5 * pixelColor, minColor, minColor * log(averageRadius * bubbles.length * virtualWidth * virtualHeight), 0, 1.91699), 1, 0.5, 0.9);
    }
  }
  /*for (idx = 0; idx < colormap.length; idx++) {
    index = 4 * idx;
    let rgb = hslToRgb(map(colormap[idx], 0, (maxRadius + minRadius) / numberOfBubbles * 2, 1, 1.91699), 1, 0.5);
    img.pixels[index] = rgb[0];
    img.pixels[index + 1] = rgb[1];
    img.pixels[index + 2] = rgb[2];
    img.pixels[index + 3] = 255;
  }*/
  img.pixels.set(buf8);
    img.updatePixels();
    avefr = (50*avefr+10*frameRate())/60;
}

function windowResized() {
  console.log(virtualWidth + " x " + virtualHeight);
  resizeCanvas(windowWidth - 5, windowHeight - 5);
  console.log(virtualWidth + " x " + virtualHeight);
  virtualWidth = width;
  virtualHeight = height;
   updateGrid();
  calculateBlobGrid();
  let before = (bubbles.length);
  for (let i = 0; i < bubbles.length; i++) {
    const br = minRadius;
    let found = 0,
      tries = 0,
      by = random(0 + br, virtualHeight - br),
      bx = random(0 + br, virtualWidth - br);
    while (!found && bubbles.length > i) {
      if (bubbles[i].x > width - bubbles[i].radius || bubbles[i].y >
        height -
        bubbles[i].radius) {
        if (tries == 500) {
          tries = 0;
          bubbles.splice(i, 1);
          found = 0;
          continue;
        } else {
          let neighbors = getNeighborhoodFromGrid(bx, by);
          found = 1;
          for (let k = 0; k < neighbors.length; k++) {
            if (dist(bx, by, neighbors[k].x, neighbors[k].y) < (
                searchSpace -
                maxRadius - topSpeed)) {
              by = random(0 + br, virtualHeight - br);
              bx = random(0 + br, virtualWidth - br);
              found = 0;
              tries++;
              break;
            }
          }
        }
        if (found && i < bubbles.length) {
          triesRecord.push(tries);
          bubbles[i].radius = br;
          //bubbles[i].x = bx;
          //bubbles[i].y = by;
          bubbles[i].center = [bx, by];
          bubbles[i].burst = 0.75;
          //addToGrid(bubbles[i]);
        }
      } else found = 1;
    }
  }
  console.log("Before: " + before + " After: " + bubbles.length);
};

function simulateTimeStep() {
    avefr = (50*avefr+10*frameRate())/60;
    for (let i = 0; i < bubbles.length; i++) {
	/*neighborhood = getNeighborhoodFromGrid(bubbles[i].x, bubbles[i].y);
	  for (let j = 0; j < neighborhood.length; j++) {
	  bubbles[i].collision(neighborhood[j]);
	  }*/
	bubbles[i].move();
	if (bubbles[i].burst) {
	    bubbles[i].history = [];
	    const intensity = bubbles[i].burst;
	    bubbles[i].burst = 0;
	    const concentrated = concentrateColor(bubbles[i].color);
	    flashNeighborhood(bubbles[i].x, bubbles[i].y, (concentrated)); // [255, 255, 255]);
	    for (let j = 0; j < bubbles[i].neighbors.length; j++) {
		if (bubbles[i] === bubbles[i].neighbors[i]) continue;
		bubbles[i].neighbors[j].color = interpolateColors(concentrated,
								  bubbles[i].neighbors[j].color, intensity);
	    }
	    //bubbles[i].color = invertColor(bubbles[i].color);
	    bubbles[i].teleport();
	}
    }
    if (laserBeams) {
	var neighbors = getNeighborhoodFromGrid(mouseX, mouseY);
	var targets = [];
	var children = [];
	neighbors.forEach(function (bubble) {
	    if (targets.indexOf(bubble) === -1) {
		targets.push(bubble)
	    }
	});
	targets.forEach(function (bubble) {
	    bubble.neighbors.forEach(function (child) {
		if (targets.indexOf(child) === -1 && children.indexOf(
		    child) ===
		    -1) {
		    children.push(child);
		}
	    });
	});
	targets.forEach(function (bubble) {
	    bubble.color = [255, 0, 255];
	    bubble.pop(1);
	});
	children.forEach(function (bubble) {
	    bubble.color = [0, 255, 255];
	    bubble.pop(0.25);
	});
	if (neighbors.length) flashNeighborhood(mouseX, mouseY, [255, 255, 255]);
    }
}

function performanceReport() {
    avefr = (50*avefr+10*frameRate())/60;
    //ts = window.performance.now();
    //ilt = window.performance.now() - ts;
    while (recentFrameRates.length > fps * 10) {
	recentFrameRates.shift();
	//innerLoopTimes.shift();
    }
    recentFrameRates.push(frameRate());
    //innerLoopTimes.push(ilt);
    if (window.performance.now() - reportTime > 10000) {
	let iltSum = 0,
	    iltVariance = 0,
	    tmpSum = 0,
	    tmpVariance = 0;
	for (let i = 0; i < recentFrameRates.length; i++) {
	    tmpSum += recentFrameRates[i];
	    //  iltSum += innerLoopTimes[i];
	}
	let avefrt = tmpSum / recentFrameRates.length;
	//  aveilt = iltSum / innerLoopTimes.length;
	averageFrameRate = (3 * averageFrameRate + avefrt) / 4;
	for (let i = 0; i < recentFrameRates.length; i++) {
	    tmpVariance += ((avefrt - recentFrameRates[i]) ** 2);
	    //      iltVariance += ((aveilt - innerLoopTimes[i]) ** 2);
	}
	console.log("++++Frame Rates++++\n10 second average:\n" + avefrt +
		    "\nstandard deviation:\n" + (sqrt(tmpVariance / recentFrameRates
						      .length)) +
		    "\nrunning average:\n" + averageFrameRate);
	//console.log("++++Inner Loop Times++++\n10 second average:\n" + aveilt +
	//"\nstandard deviation:\n" + (sqrt(iltVariance / innerLoopTimes.length))); // + "\nrunning average:\n" + averageFrameRate);
	reportTime = window.performance.now();
    }
}

function mousePressed() {
  console.log("Pop bubbles at the mouse pointer.");
  var neighbors = getNeighborhoodFromGrid(mouseX, mouseY);
  for (var i = 0; i < neighbors.length; i++) {
    neighbors[i].pop();
  }
  flashNeighborhood(mouseX, mouseY, [255, 255, 255]);
}

function keyTyped() {
  console.log("Key pressed: " + key);
  switch (key) {
  case 'b':
  case 'B':
    console.log("Pop bubbles at the mouse pointer.");
    var neighbors = getNeighborhoodFromGrid(mouseX, mouseY);
    for (var i = 0; i < neighbors.length; i++) {
      neighbors[i].pop();
    }
    flashNeighborhood(mouseX, mouseY, [255, 255, 255]);
    break;
  case 'l':
  case 'L':
    laserBeams = !laserBeams;
    console.log("FRIKKEN LASER BEAMS ENGAGED!: " + laserBeams);
    break;
  case 'r':
  case 'R':
    if (!reporting) {
      reportInterval = setInterval(performanceReport, mpf);
    } else {
      clearInterval(reportInterval);
    }
    reporting = !reporting;
    console.log("Performance report enabled: " + reporting);
    break;
  case 'p':
  case 'P':
    if (simulating) {
      clearInterval(simulationInterval);
    } else {
      simulationInterval = setInterval(simulateTimeStep, mpf);
    }
    simulating = !simulating;
    console.log("Simulation running: " + simulating);
    break;
  case '+':
    fps = constrain(fps + 5, 0, 100);
    mpf = 1000 / fps;
    //if (simulating) {
    clearInterval(simulationInterval);
    simulationInterval = setInterval(simulateTimeStep, mpf);
    //}
    if (reporting) {
      clearInterval(reportInterval);
      reportInterval = setInterval(performanceReport, mpf);
    }
    console.log("++ Simulation rate: " + fps +
      " ticks per second.\nSimulation running: " + simulating + " ++");
    break;
  case '-':
    fps = constrain(fps - 5, 0, 100);
    if (fps === 0) {
      mpf = 0;
      if (simulating) {
        clearInterval(simulationInterval);
        simulating = !simulating;
      }
      if (reporting) {
        clearInterval(reportInterval);
        reporting = !reporting;
      }
    } else mpf = 1000 / fps;
    if (simulating) {
      clearInterval(simulationInterval);
      simulationInterval = setInterval(simulateTimeStep, mpf);
    }
    if (reporting) {
      clearInterval(reportInterval);
      reportInterval = setInterval(performanceReport, mpf);
    }
    console.log("-- Simulation rate: " + fps +
      " ticks per second.\nSimulation running: " + simulating + " --");
    break;
  case 's':
  case 'S':
    console.log("Scattering bubbles.");
    bubbles.forEach(function (bubble) {
      bubble.pop(0.5);
    });
    break;
    //case 't':
    /*case 'T':
      console.log("Running benchmark...\n");
      benchmarker();
      break;*/
  }
  return false;
}

function makeToggle() {
  if (simulating) {
    clearInterval(simulationInterval);
  } else {
    simulationInterval = setInterval(simulateTimeStep, mpf);
  }
  simulating = !simulating;
  console.log("Simulation running: " + simulating);
}

function benchmarker() {
  var oltSum = 0,
    oltAverage = 0,
    oltVariance = 0,
    benchmarkStop = 0;
  simulating = 0;
  clearInterval(simulationInterval);
  var olTimes = [];
  while (drawingFlag) {}
  //noLoop();
  var benchmarkStart = window.performance.now();
  for (var ii = 0; ii < fps * 60 * 25; ii++) {
    var oltStart = window.performance.now();
    simulateTimeStep();
    olTimes.push(window.performance.now() - oltStart);
  }
  benchmarkStop = window.performance.now();
  //loop();
  olTimes.forEach(function (olt) {
    oltSum += olt;
  });
  oltAverage = oltSum / olTimes.length;
  olTimes.forEach(function (olt) {
    oltVariance += (oltAverage - olt) ** 2;
  });
  console.log("++++LoopTimes++++\nAverage:\n" + oltAverage +
    "\nStandard Deviation:\n" + (sqrt(oltVariance / olTimes.length)) +
    "\nElapsed Time: " + (benchmarkStop - benchmarkStart));
}
