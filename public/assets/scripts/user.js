import firebase from "./firebase-app";
import { showMenu } from "./utils";

document.querySelectorAll("#menu").forEach((page) => {
  const auth = firebase.auth();

  auth.onAuthStateChanged((user) => {

    if (!user) return
    const userName = document.querySelector("#userName");
    const avatar = document.querySelector("#avatar");

    userName.innerHTML = user.displayName;
    

    const photoURL = user.photoURL;
    const photoAvatar = "./assets/images/user.svg";

    avatar.src = photoURL || photoAvatar;
    

    //console.log(user);

    avatar.addEventListener("click", () => {
      showMenu(`
        <h3>${user.displayName}</h3>
        <img src="assets/images/close.svg" alt="" />
        <ul>
        <li><a href="./orders.html">Pedidos</a></li>
        <li><a href="./products.html">Produtos</a></li>
        <li><a href="./updateBusiness.html">Editar Empresa</a></li>
        </ul>
        <button type="button" id="logout">Deslogar</button>
    `);

      const logout = document.querySelector("#logout");

      logout.addEventListener("click", () => {
        sessionStorage.removeItem("breadOptions");
        sessionStorage.removeItem("ingredientsOptions");
        auth.signOut();
        window.location.href = "/login.html";
      });
      //console.log("Clicado");
    });
  });
});
