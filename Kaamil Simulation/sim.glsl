 #ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;

// simulation texture state, swapped each frame
uniform sampler2D state;

float getRed(int x, int y) {
  return float(
    texture2D( state, ( gl_FragCoord.xy + vec2(x, y) ) / resolution ).r
  );
}

float getBlue(int x, int y) {
  return float(
    texture2D( state, ( gl_FragCoord.xy + vec2(x, y) ) / resolution ).b
  );
}

float getGreen(int x, int y) {
  return float(
    texture2D( state, ( gl_FragCoord.xy + vec2(x, y) ) / resolution ).g
  );
}


void main() {

// red is ant
  // green is value
  // blue is ant direction

  float red = getRed(0, 0);
  float green = getGreen(0, 0);
  float blue = getBlue(0, 0);



  if(red == 1.0){
    gl_FragColor = vec4(0.0, abs(green - 1.0), 0.0, 1.);
  }
  else{
    gl_FragColor = vec4(red, green, blue, 1.);
  }

  if (getRed(-1, 0) == 1.0){  //the ant is its neighbor, should I become an ant?
            gl_FragColor = vec4(1.0, green, 0.5, 1.0); //ant facing right
  }

  if (getRed(1, 0) == 1.0){  //the ant is its neighbor, should I become an ant?
            gl_FragColor = vec4(1.0, green, 0.25, 1.0); //ant facing right
  }

  if (getRed(0, 1) == 1.0){  //the ant is its neighbor, should I become an ant?
            gl_FragColor = vec4(1.0, green, 1.0, 1.0); //ant facing right
  }

  if (getRed(0, -1) == 1.0){  //the ant is its neighbor, should I become an ant?
            gl_FragColor = vec4(1.0, green, .75, 1.0); //ant facing right
  }


}