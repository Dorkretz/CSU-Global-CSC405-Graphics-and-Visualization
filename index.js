// Get WebGL context
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL not supported");
}

// Vertex Shader
const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_PointSize = 2.0;
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

// Fragment Shader
const fragmentShaderSource = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White color
    }
`;

// Function to compile shaders
function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader Compilation Error: ", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create shaders
const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// Create WebGL program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program Linking Error: ", gl.getProgramInfoLog(program));
}
gl.useProgram(program);

// Function to compute Sierpinski Gasket vertices
function sierpinskiGasket(vertices, depth) {
    if (depth === 0) {
        return vertices; // Base case
    }
    let newVertices = [];
    for (let i = 0; i < vertices.length; i += 6) {
        let [x1, y1, x2, y2, x3, y3] = vertices.slice(i, i + 6);

        // Midpoints of the edges
        let mx1 = (x1 + x2) / 2, my1 = (y1 + y2) / 2;
        let mx2 = (x2 + x3) / 2, my2 = (y2 + y3) / 2;
        let mx3 = (x3 + x1) / 2, my3 = (y3 + y1) / 2;

        // Generate 3 smaller triangles
        newVertices.push(
            x1, y1, mx1, my1, mx3, my3,
            mx1, my1, x2, y2, mx2, my2,
            mx3, my3, mx2, my2, x3, y3
        );
    }
    return sierpinskiGasket(newVertices, depth - 1);
}

// Initial triangle vertices
const initialVertices = [
    -1.0, -1.0,   1.0, -1.0,   0.0, 1.0
];

const depth = 5; // Recursion depth (higher = more detailed)
const points = sierpinskiGasket(initialVertices, depth);

// Create buffer
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

// Bind position attribute
const positionLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Render function
function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length / 2);
}

render();