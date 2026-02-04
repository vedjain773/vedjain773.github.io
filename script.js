var c = document.getElementById("canva");
var $ = c.getContext("2d");

function revolve() {
  $.clearRect(0, 0, 500, 200);

  $.beginPath();
  $.arc(250, 100, 50, 0, Math.PI * 2, true);
  $.fillStyle = "#fb3640ff";
  $.fill();

  const time = new Date();
  const t = time.getSeconds() + time.getMilliseconds() / 1000;
  const angle = 2 * t * (Math.PI / 30);

  $.beginPath();
  $.arc(
    250 + 80 * Math.cos(angle),
    100 + 80 * Math.sin(angle),
    15,
    0,
    Math.PI * 2,
    true,
  );
  $.lineWidth = 1;
  $.stroke();

  window.requestAnimationFrame(revolve);
}

revolve();

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
  ctx.clearRect(0, 0, c.width, c.height);

  for (const p of points) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 5 || p.x > c.width - 5) p.vx *= -1;
    if (p.y < 5 || p.y > c.height - 5) p.vy *= -1;

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
