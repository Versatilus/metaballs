function invertColor(color) {
  var tmp = [];
  for (var i = 0; i < color.length; i++) tmp[i] = color[i] ^ 0xFF;
  return tmp;
}

function interpolateColors(c1, c2, weight = 0.5) {
  var cc = [];
  otherWeight = (2 - 2 * weight);
  for (var i = 0; i < c1.length; i++) cc[i] = sqrt((weight * 2 * Math.pow(c1[i],
    2) + otherWeight * Math.pow(c2[i], 2)) / 2);
  return cc;
}

function concentrateColor(color) {
  /*var tmp = [];
  for (var i = 0; i < color.length; i++)
    tmp[i] = (color[i] & 0xC0) >> ? 0xFF : 0;
  return tmp;*/
  if (color.length === 3) {
    r = color[0];
    g = color[1];
    b = color[2];
    r = (b <= r && r >= g) ? 255 : 0;
    g = (r <= g && g >= b) ? 255 : 0;
    b = (r <= b && b >= g) ? 255 : 0;
    return [r, g, b]; //[255, 255, 255];
  }
}
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  if (s == 0) {
    r = g = b = l; // achromatic
  } else {

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255]; // new Uint8ClampedArray([r * 255, g * 255, b * 255]);
}

function hslToRgb32(h, s, l, a) {
  var r, g, b;
  a = a ? (a * 0xFF) & 0xFF : 0xFF;

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return (a << 24) | ((b * 255) << 16) | ((g * 255) <<
    8) | (r * 255);
}

function hToRgb32(h) {
  h = Math.abs(h) % 2;
  if (h>1) h =2-h;
  var r, g, b;

  r = hue2rgb(h+1/3);
  g = hue2rgb(h);
  b = hue2rgb(h-1/3);
  
  return (0xFF << 24) | ((b * 255) << 16) | ((g * 255) <<
    8) | (r * 255);
    
  function hue2rgb(t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return 6 * t;
    if (t < 1 / 2) return 1;
    if (t < 2 / 3) return 4 - 6*t
    return 0;
  }
}

function TensorFlowHueToRgb32(h) {
  let trimmed = tf.clipByValue(h, 0, 1);
  
  var r_in, g_in, b_in;
  r_in = trimmed.add(tf.scalar(1/3));
  b_in = trimmed.sub(tf.scalar(1/3));
  g_in = trimmed;
  
  let ltzMask = tf.less(b_in, tf.scalar(0));
  let gtzMask = tf.greater(r_in, tf.scalar(1));

  // Create the red channel
  

  
  r = hue2rgb(h+1/3);
  g = hue2rgb(h);
  b = hue2rgb(h-1/3);
  
  return (0xFF << 24) | ((b * 255) << 16) | ((g * 255) <<
    8) | (r * 255);
    
  function hue2rgb(t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return 6 * t;
    if (t < 1 / 2) return 1;
    if (t < 2 / 3) return 4 - 6*t
    return 0;
  }
}
