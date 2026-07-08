var cp = document.getElementById("canvp");
var ctx = cp.getContext("2d");

const points = [
  { x: 80, y: 60, vx: 0.3, vy: 0.2 },
  { x: 200, y: 100, vx: -0.25, vy: 0.15 },
  { x: 320, y: 70, vx: 0.2, vy: -0.3 },
  { x: 400, y: 150, vx: -0.2, vy: 0.25 },
  { x: 150, y: 160, vx: 0.15, vy: -0.2 },
  { x: 260, y: 40, vx: -0.1, vy: 0.3 },
];

const threshold = 120;

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function animate() {
  ctx.clearRect(0, 0, cp.width, cp.height);

  for (const p of points) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 5 || p.x > cp.width - 5) p.vx *= -1;
    if (p.y < 5 || p.y > cp.height - 5) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#14080eff";
    ctx.fill();
  }

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = dist(points[i], points[j]);
      if (d < threshold) {
        ctx.strokeStyle = `rgba(20,8,14,${1 - d / threshold})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

animate();

const canvas = document.getElementById('bg');
const gl = canvas.getContext('webgl');

if (!gl) {
  document.querySelector('.card').innerHTML =
    '<p>WebGL not supported in this browser.</p>';
} else {

  const vsSource = `
    attribute vec2 aPos;
    void main() {
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;
    uniform vec2 uResolution;
    uniform float uTime;

    float bayer4x4(vec2 pos) {
      int x = int(mod(pos.x, 4.0));
      int y = int(mod(pos.y, 4.0));
      int index = x + y * 4;
      float table[16];
      table[0]=0.0;  table[1]=8.0;  table[2]=2.0;  table[3]=10.0;
      table[4]=12.0; table[5]=4.0;  table[6]=14.0; table[7]=6.0;
      table[8]=3.0;  table[9]=11.0; table[10]=1.0; table[11]=9.0;
      table[12]=15.0;table[13]=7.0; table[14]=13.0;table[15]=5.0;
      for (int i = 0; i < 16; i++) {
        if (i == index) return table[i] / 16.0;
      }
      return 0.0;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution.y;
      float t = uTime * 0.15;

      float TAU = 6.28318530718;
      float p1 = 0.6 * TAU;
      float p2 = 0.8 * TAU;
      float p3 = 1.0 * TAU;

      float cx = 0.5;
      float cy = 0.5;
      float fa = 7.5;

      float x = uv.x;
      float y = uv.y;
      float dist = distance(uv, vec2(cx, cy));

      float field =
          sin(x * fa + t + p1)
        + sin(y * fa - t + p2)
        + sin((x + y) * fa * 0.6 + t + p3)
        + sin(dist * 12.0 - t);

      field = field * 0.125 + 0.5;

      float threshold = bayer4x4(gl_FragCoord.xy);
      float dithered = step(threshold, field);

      vec3 offblush = vec3(0.69, 0.69, 0.69);
      vec3 blush = vec3(0.89, 0.89, 0.89);

      vec3 color = mix(blush, offblush, dithered);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  const vs = compileShader(vsSource, gl.VERTEX_SHADER);
  const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1, 1,   1, -1,   1, 1
  ]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, 'uResolution');
  const uTime = gl.getUniformLocation(program, 'uTime');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  let start = performance.now();
  let running = true;

  function render(now) {
    if (!running) return;
    const t = (now - start) / 1000;
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(render);
  });
}
