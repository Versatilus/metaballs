let makeCounter = start => _ => start++;

let nextID = makeCounter(0);

function Bubble(x, y, radius) {
    this.id = nextID();
    _radius = radius ? radius : random(maxRadius);
    _x = x ? x : random(virtualWidth);
    _y = y ? y : random(virtualHeight);
    _center = [_x, _y];
    this.topSpeed = topSpeed * randomGaussian(1,.1);
    _xspeed = random(this.topSpeed*.2, this.topSpeed) * random()>=.5?1:-1;
    _yspeed = random(this.topSpeed*.2, this.topSpeed) * random()>=.5?1:-1;     
    bubbleDimensions[this.id] = [_center[0], _center[1], _radius, _xspeed, _yspeed];
}

Bubble.prototype.move = function(others) {
  let [x, y]=this.center;
  let r= this.radius;
  let xspeed = this.xspeed;
  let yspeed = this.yspeed;
  if (x - r <= 0 || x + r >= virtualWidth)
    xspeed *= -randomGaussian(1,.1);
  if (y - r <= 0 || y + r >= virtualHeight)
    yspeed *= -randomGaussian(1,.1);
  this.center = [x + xspeed, y + yspeed];
  this.xspeed = xspeed;
  this.yspeed = yspeed;
};

Object.defineProperties(Bubble.prototype, {
  'x': {
    get: function() {
      return bubbleDimensions[this.id][0];
    },
    set: function(xval) {
        bubbleDimensions[this.id][0] = constrain(xval, 0 + this.radius, virtualWidth - this.radius);
    }
  },
  'y': {
    get: function() {
      return bubbleDimensions[this.id][1];
    },
    set: function(yval) {
        bubbleDimensions[this.id][1] = constrain(yval, 0 + this.radius, virtualHeight - this.radius);
    }
  },
  'center': {
    get: function() {
      return bubbleDimensions[this.id].slice(0, 2);
    },
    set: function(xyval) {
        bubbleDimensions[this.id][0] = constrain(xyval[0], 0 + this.radius, virtualWidth - this.radius);
        bubbleDimensions[this.id][1] = constrain(xyval[1], 0 + this.radius, virtualHeight - this.radius);
    }
  },
  'xspeed': {
    get: function() {
      return bubbleDimensions[this.id][3];
    },
    set: function(x) {
      bubbleDimensions[this.id][3] = x>= 0?1:-1*constrain(abs(x), .2*this.topSpeed, this.topSpeed);
    }
  },
  'yspeed': {
    get: function() {
      return bubbleDimensions[this.id][4];
    },
    set: function(x) {
      bubbleDimensions[this.id][4] = constrain(x, -this.topSpeed, this.topSpeed);
    }
  },
  'radius': {
    get: function() {
      return bubbleDimensions[this.id][2];
    },
    set: function(x) {
      bubbleDimensions[this.id][2] = x;
    }
  }
});
