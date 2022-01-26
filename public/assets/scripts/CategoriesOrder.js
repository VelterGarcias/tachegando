

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

//======================== Atualizar Dados ====================================
document.querySelectorAll("#form-categories").forEach(async (form) => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  let userGlobal = null;

  const btnSubmit = form.querySelector("[type=submit]");

  const productDate = [];

  const companyData = {}
  // companyData.categoriesOrder = ["Sorveteria", "Lanches" ];

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

      // const products = await db
      //   .collection("products")
      //   .where("companyId", "==", user.uid)
      //   .get();

       
      // products.forEach((item) => {
        
      //   const product = item.data();
      //   if (product.is_online) {
      //     product.id = item.id;
      //     productDate.push(product);
      //   }
        
      // });
      // console.log("product", productDate);

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
          
          // page.querySelector('p').innerHTML = products[0].name
          console.log(products);

          const ulProducts = document.querySelector(".sorteable-ul");
          renderCategoriesOrder(ulProducts, products);

          // renderProductsAdmin2(page, products);


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
      if (event.target.closest('ul.sorteable-ul')) {
        event.target.style['border-bottom'] = 'solid 4px blue';
      }
      
  });

  document.addEventListener('dragleave', function(event) {
      event.target.style['border-bottom'] = '';
  });

  document.addEventListener('drop', function(event) {
      event.preventDefault();
      // console.log(event.target);
      if (event.target.closest('ul.sorteable-ul')) {
        event.target.style['border-bottom'] = '';
        event.target.parentNode.insertBefore(dragging, event.target.nextSibling);
      }
  });




});
