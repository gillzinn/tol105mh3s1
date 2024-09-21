////////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Notandi getur snúið, hliðrað og kvarðað tening.
//     Snúningur með músarhreyfingu (með vinstri músarhnapp niðri)
//     Kvörðun með músarhreyfingu upp og niður (með Shift og
//       vinstri músarhnapp niðri)
//     Hliðrun með vinsti-/hægri-örvum
//
//    Hjálmtýr Hafsteinsson, september 2024
////////////////////////////////////////////////////////////////////
var canvas;
var gl;

var points = [];
var colors = [  ];

var movement = false;     // Do we rotate?

var origX;
var origY;


var transX = 0.0;           // Translation in X-direction
var transY = 0.0;           // Translation in Y-direction
var scaleXYZ = 1.0;         // Scaling in X, Y and Z direction
var ShiftDown = false;      // Is the Shift key down (do scaling)

var matrixLoc;

var vertexColors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 0.0, 1.0, 1.0, 1.0 ]  // cyan
    
];

var NumPoints = 5000;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );
    points = [ p ];

    
    var k = [Math.floor(Math.random() * 7)];
    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
        
        colors.push(vertexColors[k]);
    }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation( program, "transform" );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if( movement ) {
      	    transX = 2.0 * (e.offsetX - origX) / canvas.width;
            transY = 2.0 * (origY - e.offsetY) / canvas.height;

        }
    } );
    
    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case  32 :    // Space lykill
                
                var k = Math.floor(Math.random() * 7);
                for (var i = 0; i < colors.length; i++) {
                    colors[i] = vertexColors[k];
                }
                gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
                gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
                 
                break;

        }
    } );

    

    window.addEventListener("wheel", function(e){
        scaleXYZ *= 1.0 + e.deltaY/1000.0;
    });

    
    render();
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    var mv = mat4();
    
    mv = mult( mv, translate( transX, transY, 0.0 ) );
    
    
    mv = mult( mv, scalem( scaleXYZ, scaleXYZ, scaleXYZ ) );
    
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));

    gl.drawArrays( gl.POINTS, 0, points.length );

    requestAnimFrame( render );
}

