

import firebase from "./firebase-app";
import {
  showAlert,
  getFormValues,
  setFormValues,
  getQueryString,
  showModal,
  onSnapshotError,
  appendTemplate
} from "./utils";

import Sortable from 'sortablejs';


//======================== Atualizar Dados ====================================
document.querySelectorAll("#form-categories").forEach(async (form) => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  let userGlobal = null;

  const btnSubmit = form.querySelector("[type=submit]");

  const newOrder = [];
  let companyData = {}
  // companyData.categoriesOrder = ["Sorveteria", "Lanches", "Teste" ];

  // new IMask(inputPhone, {
  //   mask: "(00) [0]0000-0000)",
  // });

  // new IMask(inputCep, {
  //   mask: "00000-000",
  // });


  const renderCategoriesOrder = (targetElement, productOptions) => {

    // ========================
    
    targetElement.innerHTML = "";
    // const categoryWrapper = document.querySelector('div.categories')
    // categoryWrapper.innerHTML = "";
    // // console.log("productOptions", productOptions);
  
    let categories = [...new Set(productOptions.map(item => item.category))];
    console.log("categories", categories);
  
    // const wrapMenuCategories = document.querySelector('#menu-categories')

    if (!companyData.hasOwnProperty('categoriesOrder')) {
      categories.sort(function(a, b){
          if(a < b) { return -1; }
          if(a > b) { return 1; }
          return 0;
      })
    } else {
      console.log("Empresa já possui categorias organizadas");
      categories = Array.from(new Set(companyData.categoriesOrder.concat(categories)));
      // console.log("allCategoriesOrdened", allCategoriesOrdened);
    }
    

    // console.log("categories-sorted", categories);
    // const objCategory = {...categories};
    // console.log("categories-obj", objCategory);
    // const array2 = ["teste", "teste2", "Lanches", "Sorveteria"];
    // console.log(Array.from(new Set(categories.concat(array2))));
    
    
    categories.forEach((category, indexCategory, array) => {
      
  
      appendTemplate(
        targetElement,
        `li draggable="true"`,
        category
      );

  
    })
  
    
  
    
  };



  auth.onAuthStateChanged(async (user) => {
    console.log(user);
    if (user) {
      userGlobal = user;

      const snapshotCompany = await db
        .collection("companies")
        .doc(userGlobal.uid)
        .get();

      companyData = snapshotCompany.data();

      console.log("companyData", companyData);

      const products = [];

      db.collection("products")
        .where("companyId", "==", user.uid)
        .onSnapshot((getProducts) => {
          products.length = 0;
          
          getProducts.forEach((product) => {
            const productData = product.data();
            productData.firebaseId = product.id;
            products.push(productData);
          });
          
          console.log(products);

          const ulProducts = document.querySelector(".sorteable-ul");
          renderCategoriesOrder(ulProducts, products);


        }, onSnapshotError);
        
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

    console.log("finalOrder",newOrder);

    db.collection("companies")
      .doc(userGlobal.uid)
      .update({categoriesOrder: newOrder})
      .then(() => showAlert("Ordem das Categorias salva com sucesso"))
      .catch((err) => {
        // console.log(err);
        showAlert(err.message, true);
      })
      .finally(() => {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = "Salvar";
      });
  });


  
  document.addEventListener('drop', function(event) {
      event.preventDefault();
      
      
      const liOrdened = [...document.querySelectorAll('ul.sorteable-ul li')];
      newOrder.length = 0;
      liOrdened.forEach((categ, i) => {
        newOrder.push(categ.innerHTML);

        // Executa somente após o fim do loop
        if(++i === liOrdened.length) {
          console.log("newOrder",newOrder);

        }
      });
  });


  var el = document.querySelector('.sorteable-ul');
  // var sortable = Sortable.create(el);
  var sortable = new Sortable(el, {
      animation: 150,
      ghostClass: 'blue-background-class'
  });


});
