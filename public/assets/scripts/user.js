import firebase from "./firebase-app";
import { showMenu } from "./utils";

document.querySelectorAll("#app").forEach((page) => {
  const auth = firebase.auth();

  auth.onAuthStateChanged((user) => {
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
            <li><a href="./updateBusiness.html">Editar Dados</a></li>
            <li><a href="./orders.html">Pedidos Realizados</a></li>
            <li>${user.email}</li>
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
