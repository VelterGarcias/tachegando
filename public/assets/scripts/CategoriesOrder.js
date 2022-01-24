

import firebase from "./firebase-app";
import {
  showAlert,
  getFormValues,
  setFormValues,
  getQueryString,
  showModal
} from "./utils";

//======================== Atualizar Dados ====================================
document.querySelectorAll("#form-categories").forEach(async (form) => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  let userGlobal = null;

  const btnSubmit = form.querySelector("[type=submit]");

  const productDate = [];
  

  // new IMask(inputPhone, {
  //   mask: "(00) [0]0000-0000)",
  // });

  // new IMask(inputCep, {
  //   mask: "00000-000",
  // });


  auth.onAuthStateChanged(async (user) => {
    console.log(user);
    if (user) {
      userGlobal = user;

      const products = await db
        .collection("products")
        .where("companyId", "==", user.uid)
        .get();

       
      products.forEach((item) => {
        
        const product = item.data();
        if (product.is_online) {
          product.id = item.id;
          productDate.push(product);
        }
        
      });
      console.log("product", productDate);
        
    } else {
      auth.signOut();
      window.location.href = "/login.html";
    }
  });


  //================== Salvando os dados =================
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = "Salvando...";

    const productData = getFormValues(form);
    // console.log("productData", productData)
    productData.photo = imageElement.src;
    productData.companyId = userGlobal.uid;
    productData.price = productData.price.replace(",", ".");

    db.collection("products")
      .doc(produto)
      .update(productData)
      .then(() => showAlert("Produto salvo com sucesso"))
      .catch((err) => {
        // console.log(err);
        showAlert(err.message, true);
      })
      .finally(() => {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = "Salvar";
      });
  });


  var dragging = null;

  document.addEventListener('dragstart', function(event) {
      dragging = event.target;
      event.dataTransfer.setData('text/html', dragging);
  });

  document.addEventListener('dragover', function(event) {
      event.preventDefault();
  });

  document.addEventListener('dragenter', function(event) {
      event.target.style['border-bottom'] = 'solid 4px blue';
  });

  document.addEventListener('dragleave', function(event) {
      event.target.style['border-bottom'] = '';
  });

  document.addEventListener('drop', function(event) {
      event.preventDefault();
      event.target.style['border-bottom'] = '';
      event.target.parentNode.insertBefore(dragging, event.target.nextSibling);
  });




});
