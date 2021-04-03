const btnMenu = document.querySelector("#open-menu");
const menu = document.querySelector("#menu");
const btnClose = document.querySelector(".close");

if (btnClose) {
  btnClose.addEventListener("click", () => {
    menu.classList.remove("open");
  });
}

if (menu) {
  btnMenu.addEventListener("click", (e) => {
    menu.classList.toggle("open");
  });
}
