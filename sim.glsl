#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform float colorBool;
varying vec2 vPos;
uniform float Driver;
uniform bool invert0;
uniform bool invert1;
uniform bool invert2;
uniform bool invert3;

// simulation texture state, swapped each frame
uniform sampler2D state;

vec4 get(int x, int y) {
  return vec4(
    texture2D( state, ( gl_FragCoord.xy + vec2(x, y) ) / resolution )
  );
}

vec4 setPixel(float driver, vec4 result, bool invert, int x, int y, vec4 original){
    float val = 1.0;

    if(invert){
        val = 0.0;
    }


    if(driver <= 1.){
        if (get(x, y).r == 1.0){
            result[0] = val;
            result[1] = original[1];
            result[2] = .5;
        }
    }

    else if(driver <= 2.){
        if (get(x, y).g == 1.0){
            result[1] = val;
            result[2] = original[2];
            result[0] = .7;
        }
    }

    else if(driver <= 3.){
        if (get(x, y).b == 1.0){
            result[2] = val;
            result[0] = original[0];
            result[1] = .0;
        }
    }
    else if(driver <= 4.9){
        result = original;
    }
    return result;
}

vec4 setUp(float driver, vec4 original){

  vec4 result = vec4(0.0, 0.0, 0.0, 0.0);

  if(driver <= 1.)
    if(original.r == 1.0) result = vec4(0.0, abs(original.g - 1.0), 0.5, 1.);
    else result = original;


  else if(driver <= 2.)
    if(original.g == 1.0) result = vec4(0.7, 0.0, abs(original.b - 1.0), 1.0);
    else result = original;

  else if(driver <= 3.)
    if(original.b == 1.0) result = vec4(abs(original.r - 1.0), 0.0, 0.0, 1.0);
    else result = original;

  return result;

}

void main() {


  vec4 pixel = get(0, 0);
  vec4 result = vec4(0.0, pixel.g, 0.0, 1.0);
  //float driver = 2.0;

  result = setUp(Driver, pixel);

  result = setPixel(Driver, result, invert0, -1, 0, pixel);
  result = setPixel(Driver, result, invert1, 1, 0, pixel);
  result = setPixel(Driver, result, invert2, 0, 1, pixel);
  result = setPixel(Driver, result, invert3, 0, -1, pixel);

  gl_FragColor = (result);

