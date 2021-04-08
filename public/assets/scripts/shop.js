import firebase from "./firebase-app";
import Cookies from "js-cookie";
import {
  appendTemplate,
  onSnapshotError,
  formatCurrency,
  showModal,
} from "./utils";

const prod = true;

const renderBreadOptions = (context, breadOptions) => {
  const targetElement = context.querySelector("#breads");

  targetElement.innerHTML = "";

  breadOptions.forEach((item) => {
    appendTemplate(
      targetElement,
      "li",
      `
            <label>
            <input type="radio" name="item" value="${item.id}"  />
            <span></span>
            <h3>${item.name}</h3>
            <div>${formatCurrency(item.price)}</div>
            </label>
        `
    );
  });
};

const renderProducts = (targetElement, productOptions) => {
  targetElement.innerHTML = "";

  productOptions.forEach((item) => {
    appendTemplate(
      targetElement,
      "li",
      `
      <div id=${item.id} class="content">
        <img class="image-product" src=${item.photo} alt="Foto do ${item.name}">
        <div class="data-product" >
          <h3>${item.name}</h3>
          <span>${formatCurrency(item.price)}</span>
        </div>
      </div>
      <div class="options-product" >
        <button class="add-product" data-id="${item.id}">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
        </button>
      </div>
      `
    );
  });
};

const addOrder = (data) => {
  document.querySelectorAll(".add-product").forEach((option) => {
    option.addEventListener("click", (e) => {
      // console.log(e.currentTarget);
      let idBtn = e.currentTarget.dataset.id;
      const { name, price, photo } = data.find(
        (product) => product.id === idBtn
      );
      const newOrder = {
        name,
        price,
        photo,
      };
      const oldOrder = Cookies.getJSON("order");
      if (oldOrder) {
        // data.find( product => product.id === idBtn );
        newOrder.id = Number(Cookies.get("nextOrderId"))
        oldOrder.push(newOrder);
        Cookies.set("nextOrderId", ++newOrder.id, { expires: 15 });
        Cookies.set("order", oldOrder, { expires: 15 });
      } else {
        newOrder.id = 0;
        Cookies.set("nextOrderId", ++newOrder.id, { expires: 15 });
        Cookies.set("order", [newOrder], { expires: 15 });
      }
      renderOrderList();
      console.log("order", Cookies.getJSON("order"));
    });
  });
};

const renderOrderList = () => {
  // console.log(order);
  const menu = document.querySelector("#menu");
  const targetElement = menu.querySelector("#orderList");

  targetElement.innerHTML = "";

  let total = 0;

  const currentOrder = Cookies.getJSON("order")

  currentOrder.forEach((item) => {
    total += Number(item.price);
    appendTemplate(
      targetElement,
      "li",
      `
        <div>${item.name}</div>
        <div>${formatCurrency(item.price)}</div>
        <button type="button" aria-label="Remover ${
          item.name
        }" data-orderid="${item.id}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="black" />
          </svg>
        </button>
      `
    );
  });

  setRemoveBuguerButtonEvent(targetElement);

  menu.querySelector("footer .price span").innerHTML = formatCurrency(total);

  menu.querySelector("header strong small").innerHTML =
  currentOrder.length < 2
      ? `${currentOrder.length} produto`
      : `${currentOrder.length} produtos`;
};


const setRemoveBuguerButtonEvent = (list) => {
  const buttons = list.querySelectorAll("button");
  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const removeBurguerId = e.currentTarget.dataset.orderid

      console.log(removeBurguerId);
      let order =  Cookies.getJSON("order")
      order = order.filter((x) => +x.id !== +removeBurguerId);

      console.log(order);

      Cookies.set("order", order, { expires: 15 });

      renderOrderList();
    });
  });
};

//============= começa os códigos das páginas =================

document.querySelectorAll("#shop").forEach(async (page) => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  let hashName = window.location.hash;
  console.log(hashName);
  if (hashName) {
    let timeout = 1000;
    hashName = hashName.substring(1);
    let company = Cookies.getJSON("company");

    let download = true;

    if(company) {
      if (company.hash === hashName && prod) {
        console.log("tem", company.name, company);
        download = false;
      } else {
        Object.keys(Cookies.get()).forEach(function(cookie) {
          Cookies.remove(cookie);
        });
      }
    } 
    
    if (download) {
      company = null;
      console.log("Não tem");

      const snapshot = await db
        .collection("companies")
        .where("hash", "==", hashName)
        .get();

      if (snapshot.empty) return;

      console.log(snapshot);
      snapshot.forEach((item) => {
        company = item.data();
      });
      console.log(company);

      Cookies.set("company", company, { expires: 0.5 });
    }
    

    const companyName = document.querySelector("#company h1");
    const companySlogam = document.querySelector("#company > span");
    const logo = document.querySelector("#logo-icon");

    logo.src = company.photo;
    companyName.innerHTML = company.name;
    companySlogam.innerHTML = company.message;

    let productData = [];

    if (Cookies.get("products") && prod) {
      productData = Cookies.getJSON("products");
    } else {
      timeout = 0;
      const products = await db
        .collection("products")
        .where("companyId", "==", company.userId)
        .get();

      products.forEach((item) => {
        const product = item.data();
        if (product.is_online) {
          product.id = item.id;
          productData.push(product);
        }
        console.log("product", product.is_online, productData);
      });
      Cookies.set("products", productData, { expires: 0.041 });
    }

    const ulProducts = page.querySelector("#products");
    console.log("product", productData);
    renderProducts(ulProducts, productData);

    console.log(Cookies.getJSON("products"));

    const body = document.querySelector("body");
    setTimeout(() => {
      body.classList.remove("loading");
    }, timeout);
    body.style = `background-color: ${company.main_color}`;
    document.querySelectorAll("button").forEach((btn) => {
      btn.style = `background-color: ${company.second_color}`;
    });

    ulProducts.querySelectorAll(".content").forEach((item) => {
      item.addEventListener("click", () => {
        const { name, price, description, photo } = productData.find(
          (product) => product.id === item.id
        );
        // console.log(;
        showModal(`
            <h3>${name}</h3>
            <img class="close" src="assets/images/close.svg" alt="Fechar" />
            <img class="image-prod-modal" src=${photo} alt="Imagem do Produto" />
            <span></span>
            <span>${description}</span>
            <span><strong>Valor: ${formatCurrency(price)}</strong></span>
            <div class="options-product" >
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#fff"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z"/></svg>
              </button>
              <input type="number" name="qtd">
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#fff"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
              </button>
            </div>
          `);
      });
    });

    addOrder(productData);

    if(Cookies.getJSON("order")) renderOrderList();

  } else {
    console.log("sem hash");
    setTimeout(() => {
      window.location.href = "/products.html";
    }, 2000);
  }

  // auth.onAuthStateChanged((user) => {
  //   // console.log(user);
  //   db.collection("bread").onSnapshot((snapshot) => {
  //     const breadOptions = [];

  //     snapshot.forEach((item) => {
  //       breadOptions.push(item.data());
  //     });

  //     sessionStorage.setItem("breadOptions", JSON.stringify(breadOptions));

  //     renderBreadOptions(page, breadOptions);
  //   }, onSnapshotError);

  //   db.collection("ingredients").onSnapshot((snapshot) => {
  //     const ingredientsOptions = [];

  //     snapshot.forEach((item) => {
  //       ingredientsOptions.push(item.data());
  //     });

  //     sessionStorage.setItem(
  //       "ingredientsOptions",
  //       JSON.stringify(ingredientsOptions)
  //     );

  //     renderIngredientsOptions(page, ingredientsOptions);
  //   }, onSnapshotError);
  // });
});
