#ifdef GL_ES
    precision mediump float;
    #endif

    uniform sampler2D uSampler;
    uniform vec2 resolution;
    uniform bool monochrome;
    uniform bool original;

    void main() {
      vec4 pixel = texture2D( uSampler, gl_FragCoord.xy / resolution );
      if(original && !monochrome){
        gl_FragColor = vec4(pixel.r, pixel.g, pixel.b, 1.0);
      }
      else{
        if(monochrome){
            pixel.b = (pixel.r-pixel.g);
        }
        gl_FragColor = vec4( (pixel.r-pixel.g), (pixel.r-pixel.g), pixel.b, 1. );
      }
