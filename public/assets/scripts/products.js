import firebase from "./firebase-app";
import {
  appendTemplate,
  formatCurrency,
  onSnapshotError,
  showAlert,
  showModal,
  getOrderId,
} from "./utils";





document.querySelectorAll("#list-products").forEach((page) => {
  const auth = firebase.auth();
  const db = firebase.firestore();

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
            <ul>
              <li>
                <b><span>${item.name}</span></b>
              </li>
              <li>
                <span>${formatCurrency(item.price)}</span>
              </li>
              <li>
                <span>Categoria:</span>
                <span>&ensp;${item.category}</span>
              </li>
            </ul>
          </div>
          <div class="actions ${!item['is_online'] && 'offline'}" id="${item.firebaseId}" data-order="${
          item.firebaseId
        }">
            
            
            <a href="/product.html?produto=${item.firebaseId}">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path
                  d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
              </svg>
            </a>
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
  
    //========= Botão excluir pedido ====================
  
    const btnDelete = document.querySelectorAll(".delete");
  
    btnDelete.forEach((btn) => {
      btn.addEventListener("click", () => {
        showModal(`
        <div class="modal-alert">
          <h3>Tem certeza que deseja excluir esse pedido?</h3>
          <p>
            <button id="btn-cancel">Cancelar</button>
            <button id="btn-delete" class="danger" >Excluir</button>
          </p>
        </div>
        
      `);
        const btnCancel = document.querySelector("#btn-cancel");
        const btnDelete = document.querySelector("#btn-delete");
  
        btnCancel.addEventListener("click", () => {
          modal.classList.remove("open");
        });
  
        btnDelete.addEventListener("click", () => {
          const id = getOrderId(btn);
          console.log(id);
          // const order_id = btn.closest(".actions").dataset.order;
          db.collection("products")
            .doc(id)
            .delete()
            .then(() => {
              showAlert(
                `O produto foi excluido com sucesso!`
              );
            })
            .catch((err) => showAlert(err, true));
          modal.classList.remove("open");
        });
      });
    });
  
  
  };

  // =====================================================================================

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
