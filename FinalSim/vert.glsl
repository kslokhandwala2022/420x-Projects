 attribute vec2 a_position;
    varying vec2 vPos;

    void main() {
      vPos = a_position;
      gl_Position = vec4( a_position, 0, 1 );//2D
    }