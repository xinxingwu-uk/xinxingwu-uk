document.addEventListener("click", function(e){
  var btn = e.target.closest(".reveal-btn");
  if(!btn) return;

  var id = btn.getAttribute("data-answer");
  var box = document.getElementById(id);
  if(!box) return;

  var isHidden = (box.style.display === "" || box.style.display === "none");

  box.style.display = isHidden ? "block" : "none";
  btn.textContent = isHidden ? "Hide Answer" : "Show Answer";
});
