(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//let gl, uTime
const glslify = require( 'glslify' )
//////////////////////////////////////



let gl, framebuffer,
    simulationProgram, drawProgram,
    uTime, uSimulationState,
    textureBack, textureFront,
    dimensions = { width:null, height:null },
    uDriver, uInvert1, uInvert2, uInvert3, uInvert0, uOrginal, uMonochrome;
let speckle = false;

window.onload = function() {
    const canvas = document.getElementById( 'gl' )
    gl = canvas.getContext( 'webgl' )
    canvas.width = dimensions.width = window.innerWidth
    canvas.height = dimensions.height = window.innerHeight

    // define drawing area of webgl canvas. bottom corner, width / height
    // XXX can't remember why we need the *2!
    gl.viewport( 0,0, gl.drawingBufferWidth, gl.drawingBufferHeight )

    makeBuffer()
    makeShaders()
    makeTextures()
    setInitialState(canvas)

}

//NEW CODE NEW CODE
function poke( x, y, value, texture ) {
    gl.bindTexture( gl.TEXTURE_2D, texture )

    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D
    gl.texSubImage2D(
        gl.TEXTURE_2D, 0,
        // x offset, y offset, width, height
        x, y, 1, 1,
        gl.RGBA, gl.UNSIGNED_BYTE,
        // is supposed to be a typed array
        new Uint8Array([ 255, 255, 255, 255 ])
    )
}

function setInitialState(canvas) {

    canvas.onmousedown = function(event){
        //console.debug(event);
        poke((event.offsetX), canvas.height- (event.offsetY), 255, textureBack);
    }
    canvas.onmousemove = function(event){
        //console.debug(event);
        if (!speckle){
            poke((event.offsetX), canvas.height- (event.offsetY), 255, textureBack);
        }
    }
    window.onkeydown = function(event){
        if(event.key === 'Shift'){
            speckle = true;
        }
    }
    window.onkeyup = function(event){
        if(event.key === 'Shift'){
            speckle = false;
        }
    }

    /*for( i = 0; i < dimensions.width; i++ ) {
        for( j = 0; j < dimensions.height; j++ ) {
            if( Math.random() > .75 ) {
                poke( i, j, 255, textureBack )
            }
        }
    }*/
}

function makeBuffer() {
    // create a buffer object to store vertices
    const buffer = gl.createBuffer()

    // point buffer at graphic context's ARRAY_BUFFER
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer )

    const triangles = new Float32Array([
        -1, -1,
        1, -1,
        -1,  1,
        -1,  1,
        1, -1,
        1,  1
    ])

    // initialize memory for buffer and populate it. Give
    // open gl hint contents will not change dynamically.
    gl.bufferData( gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW )
}

function makeShaders() {
    // create vertex shader
    let shaderScript = document.getElementById('vertex')
    let shaderSource = shaderScript.text
    const vertexShader = gl.createShader( gl.VERTEX_SHADER )
    gl.shaderSource( vertexShader, shaderSource )
    gl.compileShader( vertexShader )

    // create fragment shader
    shaderScript = document.getElementById('render')
    shaderSource = shaderScript.text
    const drawFragmentShader = gl.createShader( gl.FRAGMENT_SHADER )
    gl.shaderSource( drawFragmentShader, shaderSource )
    gl.compileShader( drawFragmentShader )
    console.log( gl.getShaderInfoLog(drawFragmentShader) )

    // create render program that draws to screen
    drawProgram = gl.createProgram()
    gl.attachShader( drawProgram, vertexShader )
    gl.attachShader( drawProgram, drawFragmentShader )

    gl.linkProgram( drawProgram )
    gl.useProgram( drawProgram )

    uRes = gl.getUniformLocation( drawProgram, 'resolution' )
    gl.uniform2f( uRes, gl.drawingBufferWidth, gl.drawingBufferHeight )


    // get position attribute location in shader
    let position = gl.getAttribLocation( drawProgram, 'a_position' )
    // enable the attribute
    gl.enableVertexAttribArray( position )
    // this will point to the vertices in the last bound array buffer.
    // In this example, we only use one array buffer, where we're storing
    // our vertices
    gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 0,0 )

    shaderScript = document.getElementById('simulation')
    shaderSource = shaderScript.text
    const simulationFragmentShader = gl.createShader( gl.FRAGMENT_SHADER )
    gl.shaderSource( simulationFragmentShader, shaderSource )
    gl.compileShader( simulationFragmentShader )
    console.log( gl.getShaderInfoLog( simulationFragmentShader ) )

    // create simulation program
    simulationProgram = gl.createProgram()
    gl.attachShader( simulationProgram, vertexShader )
    gl.attachShader( simulationProgram, simulationFragmentShader )

    gl.linkProgram( simulationProgram )
    gl.useProgram( simulationProgram )

    uRes = gl.getUniformLocation( simulationProgram, 'resolution' )
    gl.uniform2f( uRes, gl.drawingBufferWidth, gl.drawingBufferHeight )

    // find a pointer to the uniform "time" in our fragment shader
    uTime = gl.getUniformLocation( simulationProgram, 'time' )

    uSimulationState = gl.getUniformLocation( simulationProgram, 'state' )
    uColorBool = gl.getUniformLocation( simulationProgram, 'colorBool' );

    position = gl.getAttribLocation( simulationProgram, 'a_position' )
    gl.enableVertexAttribArray( simulationProgram )
    gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 0,0 )


    //Added stuff
    uDriver = gl.getUniformLocation( simulationProgram, 'Driver' );
    uInvert0 = gl.getUniformLocation( simulationProgram, 'invert0' );
    uInvert1 = gl.getUniformLocation( simulationProgram, 'invert1' );
    uInvert2 = gl.getUniformLocation( simulationProgram, 'invert2' );
    uInvert3 = gl.getUniformLocation( simulationProgram, 'invert3' );
    uOrginal = gl.getUniformLocation( drawProgram, 'original' );
    uMonochrome = gl.getUniformLocation( drawProgram, 'monochrome' );

}

function makeTextures() {
    textureBack = gl.createTexture()
    gl.bindTexture( gl.TEXTURE_2D, textureBack )

    // these two lines are needed for non-power-of-2 textures
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE )

    // how to map when texture element is less than one pixel
    // use gl.NEAREST to avoid linear interpolation
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST )
    // how to map when texture element is more than one pixel
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    // specify texture format, see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, dimensions.width, dimensions.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null )

    textureFront = gl.createTexture()
    gl.bindTexture( gl.TEXTURE_2D, textureFront )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST )
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, dimensions.width, dimensions.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null )

    // Create a framebuffer and attach the texture.
    framebuffer = gl.createFramebuffer()

    // textures loaded, now ready to render
    render()
}


let tweak = new function () {
    this.driver = 1.0;
    this.invert0 = false;
    this.invert1 = false;
    this.invert2 = false;
    this.invert3 = false;
    this.pause = false;
    this.reset = false;
    this.pulse = false;
    this.pulseTime = 10;
    this.original = false;
    this.monochrome = false;
    this.Reset = function () {
        this.reset = true;
    };
    this.MountainsPreset = function () {
        //this.driver = 1.0;
        this.invert0 = false;
        this.invert1 = false;
        this.invert2 = true;
        this.invert3 = false;
        this.pause = false;
        this.reset = true;
        //  this.pulse = true;
        this.pulseTime = 40;
        this.original = true;
        this.monochrome = false;
    };
    this.SpiralsPreset = function () {
        //this.driver = 1.0;
        this.invert0 = false;
        this.invert1 = false;
        this.invert2 = false;
        this.invert3 = false;
        //  this.pause = false;
        this.reset = true;
        this.pulse = true;
        this.pulseTime = 10;
        this.original = false;
        this.monochrome = true;
    };
    this.GridPreset = function () {
        this.invert0 = false;
        this.invert1 = true;
        this.invert2 = false;
        this.invert3 = true;
        // this.pause = false;
        this.reset = false;
        this.pulse = false;
        this.original = true;
        this.monochrome = false;
    };
    this.SandPreset = function () {
        this.invert0 = false;
        this.invert1 = false;
        this.invert2 = false;
        this.invert3 = true;
        // this.pause = false;
        this.reset = false;
        this.pulse = false;
        this.original = true;
        this.monochrome = false;
    };

}
let gui = new dat.GUI();
gui.add(tweak, 'driver', 0.0, 3.0);
gui.add(tweak, 'invert0');
gui.add(tweak, 'invert1');
gui.add(tweak, 'invert2');
gui.add(tweak, 'invert3');
gui.add(tweak, 'pulse');
gui.add(tweak, 'pulseTime', 0.5, 50.0);
gui.add(tweak, 'original');
gui.add(tweak, 'monochrome');
gui.add(tweak, 'pause');
gui.add(tweak, 'Reset');
gui.add(tweak, 'MountainsPreset');
gui.add(tweak, 'SpiralsPreset');
gui.add(tweak, 'GridPreset');
gui.add(tweak, 'SandPreset');


// keep track of time via incremental frame counter
let time = 0
function render() {
    // schedules render to be called the next time the video card requests
    // a frame of video

    window.requestAnimationFrame( render )

    // use our simulation shader
    gl.useProgram( simulationProgram )
    // update time on CPU and GPU

    gl.uniform1i(uInvert0, tweak.invert0);
    gl.uniform1i(uInvert1, tweak.invert1);
    gl.uniform1i(uInvert2, tweak.invert2);
    gl.uniform1i(uInvert3, tweak.invert3);
    if(tweak.reset === true){
        gl.uniform1f(uDriver, 5.0);
        tweak.reset = false;
    }
    else if(tweak.pause === true){
        gl.uniform1f(uDriver, 4.5);
    }
    else if(tweak.pulse === true)
        gl.uniform1f(uDriver, (time/tweak.pulseTime)%4 );
    else{
        gl.uniform1f(uDriver, tweak.driver);
    }

    if(!tweak.pause){
        time++
        gl.uniform1f( uTime, time )

    }





    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer )
    // use the framebuffer to write to our texFront texture
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureFront, 0 )
    // set viewport to be the size of our state (game of life simulation)
    // here, this represents the size that will be drawn onto our texture
    gl.viewport(0, 0, dimensions.width,dimensions.height )

    // in our shaders, read from texBack, which is where we poked to
    gl.activeTexture( gl.TEXTURE0 )
    gl.bindTexture( gl.TEXTURE_2D, textureBack )
    gl.uniform1i( uSimulationState, 0 )
    // run shader
    gl.drawArrays( gl.TRIANGLES, 0, 6 )

    // swap our front and back textures
    let tmp = textureFront
    textureFront = textureBack
    textureBack = tmp

    // use the default framebuffer object by passing null
    gl.bindFramebuffer( gl.FRAMEBUFFER, null )
    // set our viewport to be the size of our canvas
    // so that it will fill it entirely
    gl.viewport(0, 0, dimensions.width,dimensions.height )
    // select the texture we would like to draw to the screen.
    // note that webgl does not allow you to write to / read from the
    // same texture in a single render pass. Because of the swap, we're
    // displaying the state of our simulation ****before**** this render pass (frame)
    gl.bindTexture( gl.TEXTURE_2D, textureFront )
    // use our drawing (copy) shader
    gl.useProgram( drawProgram )

    gl.uniform1i(uOrginal, tweak.original);
    gl.uniform1i(uMonochrome, tweak.monochrome);
    // put simulation on screen
    gl.drawArrays( gl.TRIANGLES, 0, 6 )
}

//////////////////////////////////

},{"glslify":2}],2:[function(require,module,exports){
module.exports = function(strings) {
  if (typeof strings === 'string') strings = [strings]
  var exprs = [].slice.call(arguments,1)
  var parts = []
  for (var i = 0; i < strings.length-1; i++) {
    parts.push(strings[i], exprs[i] || '')
  }
  parts.push(strings[i])
  return parts.join('')
}

},{}]},{},[1]);
