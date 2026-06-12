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
