(function () {
  var themeSelect = document.getElementById("themeSelect");
  var savedTheme = localStorage.getItem("syllabus_theme");
  if (savedTheme) {
    document.body.setAttribute("data-theme", savedTheme);
    if (themeSelect) themeSelect.value = savedTheme;
  }
  if (themeSelect) {
    themeSelect.addEventListener("change", function () {
      var val = themeSelect.value;
      document.body.setAttribute("data-theme", val);
      localStorage.setItem("syllabus_theme", val);
    });
  }

  var canvas = document.getElementById("sigCanvas");
  var imgPrint = document.getElementById("sigPrintImage");
  var wm = document.getElementById("printWatermark");
  var clearBtn = document.getElementById("sigClearBtn");
  var printBtn = document.getElementById("printBtn");

  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var drawing = false;
  var hasInk = false;
  var last = { x: 0, y: 0 };

  function setPenStyle() {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "#0f172a";
    ctx.fillStyle = "#0f172a";
  }

  function resizeCanvasToDisplaySize() {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var dpr = window.devicePixelRatio || 1;
    var newW = Math.round(rect.width * dpr);
    var newH = Math.round(rect.height * dpr);

    if (canvas.width !== newW || canvas.height !== newH) {
      var data = canvas.toDataURL("image/png");
      canvas.width = newW;
      canvas.height = newH;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      setPenStyle();

      var img = new Image();
      img.onload = function () { ctx.drawImage(img, 0, 0, rect.width, rect.height); };
      img.src = data;
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      setPenStyle();
    }
  }

  function getPos(e) {
    var rect = canvas.getBoundingClientRect();
    var clientX, clientY;

    if (e.touches && e.touches.length) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function dot(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  function syncSignatureImages() {
    if (!imgPrint || !wm) return;

    if (!hasInk) {
      imgPrint.removeAttribute("src");
      wm.removeAttribute("src");
      return;
    }

    var data = "";
    try { data = canvas.toDataURL("image/png"); } catch (err) { data = ""; }

    if (!data) return;

    imgPrint.src = data;
    wm.src = data;
  }

  function start(e) {
    drawing = true;
    last = getPos(e);
    setPenStyle();
    dot(last.x, last.y);
    hasInk = true;
    syncSignatureImages();
    e.preventDefault();
  }

  function move(e) {
    if (!drawing) return;
    var p = getPos(e);

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    last = p;
    hasInk = true;
    syncSignatureImages();
    e.preventDefault();
  }

  function end() {
    drawing = false;
    syncSignatureImages();
  }

  function clearSignature() {
    var rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    hasInk = false;
    if (imgPrint) imgPrint.removeAttribute("src");
    if (wm) wm.removeAttribute("src");
  }

  function doPrint() {
    syncSignatureImages();
    setTimeout(function () { window.print(); }, 60);
  }

  canvas.addEventListener("pointerdown", start);
  canvas.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);

  canvas.style.touchAction = "none";

  if (clearBtn) clearBtn.addEventListener("click", clearSignature);
  if (printBtn) printBtn.addEventListener("click", doPrint);

  window.addEventListener("beforeprint", function () {
    syncSignatureImages();
  });

  setTimeout(function () { resizeCanvasToDisplaySize(); }, 0);
  window.addEventListener("resize", resizeCanvasToDisplaySize);
})();
