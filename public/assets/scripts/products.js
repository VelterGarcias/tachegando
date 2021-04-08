import firebase from "./firebase-app";
import {
  appendTemplate,
  formatCurrency,
  onSnapshotError,
  showAlert,
  showModal,
  getOrderId,
} from "./utils";

const renderProductsAdmin = (targetElement, productOptions) => {
  targetElement.innerHTML = "";

  productOptions.forEach((item) => {
    
    appendTemplate(
      targetElement,
      "li",
      `
        <div class="id">
        <img src=${item.photo} alt="Foto do Produto"/>
        </div>
        <div class="content">
          <div class="title">Detalhes do Produto</div>
          <ul>
            <li>
              <span>Nome:</span>
              <span>${item.name}</span>
            </li>
            <li>
              <span>Valor:</span>
              <span>${formatCurrency(item.price)}</span>
            </li>
            <li>
              <span>Categoria:</span>
              <span>${item.category}</span>
            </li>
            <li>
              <span>Descrição:</span>
              <span>${item.description}</span>
            </li>
          </ul>
        </div>
        <div class="actions" id="${item.firebaseId}" data-order="${
        item.firebaseId
      }">
          <button class="share" type="button" aria-label="Share" title="Compartilhar">
            <svg
              width="18"
              height="20"
              viewBox="0 0 18 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 14.08C14.24 14.08 13.56 14.38 13.04 14.85L5.91 10.7C5.96 10.47 6 10.24 6 10C6 9.76 5.96 9.53 5.91 9.3L12.96 5.19C13.5 5.69 14.21 6 15 6C16.66 6 18 4.66 18 3C18 1.34 16.66 0 15 0C13.34 0 12 1.34 12 3C12 3.24 12.04 3.47 12.09 3.7L5.04 7.81C4.5 7.31 3.79 7 3 7C1.34 7 0 8.34 0 10C0 11.66 1.34 13 3 13C3.79 13 4.5 12.69 5.04 12.19L12.16 16.35C12.11 16.56 12.08 16.78 12.08 17C12.08 18.61 13.39 19.92 15 19.92C16.61 19.92 17.92 18.61 17.92 17C17.92 15.39 16.61 14.08 15 14.08Z"
                fill="#070D0D"
              />
            </svg>
          </button>
          <button class="detail" type="button" aria-label="Detail" title="Detalhes">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 2V16H2V2H16ZM17.1 0H0.9C0.4 0 0 0.4 0 0.9V17.1C0 17.5 0.4 18 0.9 18H17.1C17.5 18 18 17.5 18 17.1V0.9C18 0.4 17.5 0 17.1 0ZM8 4H14V6H8V4ZM8 8H14V10H8V8ZM8 12H14V14H8V12ZM4 4H6V6H4V4ZM4 8H6V10H4V8ZM4 12H6V14H4V12Z"
                fill="#070D0D"
              />
            </svg>
          </button>
          <a href="/product.html?produto=${item.firebaseId}">Editar</a>
          <button class="delete" type="button" aria-label="Excluir" title="Excluir">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
                fill="#070D0D"
              />
            </svg>
          </button>
        </div>
      `
    );
  });
};



document.querySelectorAll("#list-products").forEach((page) => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const btnNewProduct = document.querySelector('#new-product')

  auth.onAuthStateChanged(async (user) => {

    if (!user) {
      showAlert("Você precisa fazer login primeiro", true);
      setTimeout(() => {
        window.location.href = "/login.html";
      }, 3000);
    }
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

        renderProductsAdmin(page, products);


      }, onSnapshotError);
      

      btnNewProduct.addEventListener("click", (e) => {
        console.log("novo");

        db.collection("products")
        .add({name: "Novo Produto"})
        .then((res) => {
          console.log(res.id)
          window.location.href = `/product.html?produto=${res.id}`
        })
        .catch((err) => {
          console.log(err);
          showAlert(err.message, true)
        })

      });
      
      
  });
});
