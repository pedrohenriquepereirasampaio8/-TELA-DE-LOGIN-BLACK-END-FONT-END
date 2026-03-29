const API = "http://localhost:3000";

// ================= PARTICULAS =================
const canvas = document.getElementById("particles");

if (canvas) {
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  let particles = [];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: Math.random() + 0.2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      p.y += p.speed;
      if (p.y > canvas.height) {
        p.y = 0;
        p.x = Math.random() * canvas.width;
      }
    });

    requestAnimationFrame(draw);
  }

  draw();
}

// ================= CADASTRO =================
async function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    return showMessage("Preencha todos os campos");
  }

  try {
    const res = await fetch(API + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    showMessage(data.message || data.error);

  } catch {
    showMessage("Erro ao conectar com servidor");
  }
}

// ================= LOGIN =================
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loading = document.getElementById("loading");

  if (!username || !password) {
    return showMessage("Preencha todos os campos");
  }

  if (loading) loading.classList.remove("hidden");

  try {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (loading) loading.classList.add("hidden");

    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "home.html";
    } else {
      showMessage(data.error);
    }

  } catch {
    if (loading) loading.classList.add("hidden");
    showMessage("Erro ao conectar com servidor");
  }
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// ================= PROTEÇÃO =================
(function () {
  const token = localStorage.getItem("token");
  const path = window.location.pathname;

  if (path.includes("home.html") && !token) {
    window.location.href = "index.html";
  }

  if ((path.endsWith("index.html") || path === "/") && token) {
    window.location.href = "home.html";
  }
})();

// ================= MENSAGEM =================
function showMessage(msg) {
  const el = document.getElementById("message");
  if (!el) return;

  el.innerText = msg;

  el.style.opacity = 0;
  setTimeout(() => {
    el.style.opacity = 1;
  }, 100);
}