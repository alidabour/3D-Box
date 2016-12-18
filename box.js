"use strict";

var canvas;
var gl;
var program;

var normalsArray = [];
var lightPosition = vec4(3.0,3.0,3.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;

var nBuffer;
var tBuffer;
var tBuffer;
var cBuffer;
var vBuffer;

var score=0;
var numOfCubes = 0;

var pointsArray = [];
var colorsArray = [];
var translation = [];
var texCoordsArray = [];

var transLoc;
var texture;

// all translation matrix (0>translationStop , 1>translationMoving )
var allTra=[];

var gameOver=false;
var boxPlaces= [
                [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
                [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
                [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
                [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
                ];
var x = [0,0.5,1,1.5];
var y = [0,-0.5,-1.0,-1.5];
var z=2;
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

//Matrix to Stop the cube 
var translationStop = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0,0,0, 1
];

//cube vertices (from 0 to 7) + floor Vertices (from 8 to 11)
var vertices = [
    
    vec4(-1.0, -1.0,  1.0, 1.0),
    vec4(-1.0,  -0.5,  1.0, 1.0),
    vec4(-0.5,  -0.5,  1.0, 1.0),
    vec4(-0.5, -1.0,  1.0, 1.0),
    vec4(-1.0, -1.0, 0.5, 1.0),
    vec4(-1.0,  -0.5, 0.5, 1.0),
    vec4(-0.5,  -0.5, 0.5, 1.0),
    vec4( -0.5, -1.0, 0.5, 1.0)
    ,
    vec4(-1.0, -1.0,  -1.0, 1.0),
    vec4(-1.0, -1.0,  1.0, 1.0),
    vec4(1.0, -1.0,  1.0, 1.0),
    vec4(1.0, -1.0,  -1.0, 1.0)
];
//use to set color of cube and floor
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  
    vec4( 1.0, 0.0, 0.0, 1.0 ),  
    vec4( 1.0, 1.0, 0.0, 1.0 ), 
    vec4( 0.0, 1.0, 0.0, 1.0 ),  
    vec4( 0.0, 0.0, 1.0, 1.0 ),  
    vec4( 1.0, 0.0, 1.0, 1.0 ),  
    vec4( 0.0, 1.0, 1.0, 1.0 ),  
    vec4( 1.0, 0.5, 0.0, 1.0 )
];


var near = 0.94;
var far = 9.41;
var radius = 3;
var theta  = 0.8443460952792065;
var phi    = 0.5235987755982988 ;
var dr = 15.0 * Math.PI/180.0;

var  fovy = 90.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelView, projection;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function quad(a, b, c, d, t, r) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[3]);

     pointsArray.push(vertices[a]);
     translation.push(t);
     colorsArray.push(vertexColors[r]);
     
     pointsArray.push(vertices[b]);
     translation.push(t);
     colorsArray.push(vertexColors[r]);
     
     pointsArray.push(vertices[c]);
     translation.push(t);
     colorsArray.push(vertexColors[r]);
     
     pointsArray.push(vertices[a]);
     translation.push(t);
     colorsArray.push(vertexColors[r]);
     
     pointsArray.push(vertices[c]);
     translation.push(t);
     colorsArray.push(vertexColors[r]);
     
     pointsArray.push(vertices[d]);
     translation.push(t);
     colorsArray.push(vertexColors[r]);
}
function addFloor()
{   
    var r = Math.ceil((Math.random()*7));
    quad( 8,9,10,11 ,0.0,r);
    //send  points , colors and translation to shader
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(pointsArray));
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsArray));
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER,0, flatten(normalsArray));
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER,0, flatten(texCoordsArray));
}
function addCube(){
    z=2;
    var r = Math.ceil((Math.random()*7));
    numOfCubes++;
    //delete old data
    colorsArray=[];
    pointsArray=[];
    translation=[];
    normalsArray=[];
    texCoordsArray=[];
    
    //create 6 face of cube , with 1.0 aka set as moving 
    quad( 1, 0, 3, 2 ,1.0,r);
    quad( 2, 3, 7, 6 ,1.0,r);
    quad( 3, 0, 4, 7 ,1.0,r);
    quad( 6, 5, 1, 2 ,1.0,r);
    quad( 4, 5, 6, 7 ,1.0,r);
    quad( 5, 4, 0, 1 ,1.0,r);
    
    //send cube points, colors, translation to shader
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferSubData(gl.ARRAY_BUFFER, (576*numOfCubes)+96, flatten(colorsArray));
    
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, (576*numOfCubes)+96, flatten(pointsArray));
    
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, (16*36*numOfCubes)+(96), flatten(normalsArray));
    
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, (8*36*numOfCubes)+(48), flatten(texCoordsArray));
    var xR = Math.ceil((Math.random()*4))-1;
    var yR = Math.ceil((Math.random()*4))-1;
    allTra[numOfCubes]=[
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x[xR],2,y[yR], 1
    ];
}
var left = function(){
     if(!gameOver && allTra[numOfCubes][14]!=0.0 && boxPlaces[allTra[numOfCubes][12]*2][z][(allTra[numOfCubes][14]+0.5)*-2] !=1)
      allTra[numOfCubes][14]+=0.5;
}
var right = function(){
    if(!gameOver && allTra[numOfCubes][14]!=-1.5 && boxPlaces[allTra[numOfCubes][12]*2][z][(allTra[numOfCubes][14]-0.5)*-2] !=1)
         allTra[numOfCubes][14]-=0.5;
}
var upkey = function(){
    if(!gameOver && allTra[numOfCubes][12]!=0.0 && boxPlaces[(allTra[numOfCubes][12]-0.5)*2][z][(allTra[numOfCubes][14])*-2] !=1)
         allTra[numOfCubes][12]-=0.5;
}
var down = function(){
     if(!gameOver && allTra[numOfCubes][12]!=1.5 && boxPlaces[(allTra[numOfCubes][12]+0.5)*2][z][(allTra[numOfCubes][14])*-2] !=1)
        allTra[numOfCubes][12]+=0.5;
}
window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch(key) {
            case '(':
                down();
                break;
            case '&':
                upkey();
                break;
            case '\'':
                right();
                break;
            case '%':
                left();
                break;
        }
    };

  
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    aspect =  canvas.width/canvas.height;

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*36*50, gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*36*50, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*36*50, gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*36*50, gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );
    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"),materialShininess);

    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );
    transLoc = gl.getUniformLocation(program, "translate");
    
    
    addFloor();
    addCube();

    // buttons for viewing parameters
    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1; };
    document.getElementById("Button2").onclick = function(){near *= 0.9; far *= 0.9; };
    document.getElementById("incR").onclick = function(){radius += 2.0;};
    document.getElementById("decR").onclick = function(){ radius -= 0.5;};
    document.getElementById("incTheta").onclick = function(){theta += dr; };
    document.getElementById("decTheta").onclick = function(){theta -= dr; };
    document.getElementById("Button7").onclick = function(){phi += dr; };
    document.getElementById("Button8").onclick = function(){phi -= dr;};
    document.getElementById("Left").onclick = left;
        document.getElementById("Right").onclick = right;

    document.getElementById("Up").onclick = upkey;
    document.getElementById("Down").onclick = down;

    var image = document.getElementById("texImage");
    configureTexture( image );

    render();
}


var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    theta +=dr*0.0005;
    //phi+=dr*0.006;
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
    
    mvMatrix = lookAt(eye, at , up);
    pMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
    
    //Draw floor and set translation to stop
    gl.uniformMatrix4fv(transLoc,false,flatten(translationStop));
    gl.drawArrays(gl.TRIANGLES,0,6);
    for (var i=1; i<=numOfCubes; i++){
        gl.uniformMatrix4fv(transLoc,false,flatten(allTra[i]));
        gl.drawArrays(gl.TRIANGLES,(6+(36*(i))),36);
    }
    if (allTra[numOfCubes][13]>1.5){
        z=2;
    }
    else if(allTra[numOfCubes][13]<=1.1 && allTra[numOfCubes][13]>0.6){
        z=1
    }else if(allTra[numOfCubes][13]<=0.35&& allTra[numOfCubes][13]>0.0){
        z=0;
    }

    if(allTra[numOfCubes][13]<=1.0 && allTra[numOfCubes][13]>0.9){
        //check if next place is not empty
        if(boxPlaces[allTra[numOfCubes][12]*2][1][(allTra[numOfCubes][14])*-2]==1){
            document.getElementById("score").innerHTML="Game Over";
            gameOver=true;
            }else{
                allTra[numOfCubes][13]-=0.0159;
            }
        }
        else if(allTra[numOfCubes][13]<=0.4 && allTra[numOfCubes][13]>0.35){
             if(boxPlaces[allTra[numOfCubes][12]*2][0][(allTra[numOfCubes][14])*-2]==1){
                allTra[numOfCubes][13]=0.5;
                score+=10;
                document.getElementById("score").innerHTML="Score : "+score;
                boxPlaces[allTra[numOfCubes][12]*2][1][(allTra[numOfCubes][14])*-2]=1;
                addCube();
        }else{
                allTra[numOfCubes][13]-=0.0159;
            }
        }
    else if(allTra[numOfCubes][13]<=0.0){
            score+=10;
            document.getElementById("score").innerHTML="Score : "+score;
            boxPlaces[allTra[numOfCubes][12]*2][0][(allTra[numOfCubes][14])*-2]=1;
            addCube();

        }
    else{
        allTra[numOfCubes][13]-=0.0159;
    }

    requestAnimFrame(render);
}
