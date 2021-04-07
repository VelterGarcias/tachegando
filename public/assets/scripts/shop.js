import firebase from "./firebase-app";
import { appendTemplate, onSnapshotError, formatCurrency } from "./utils";

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
      <img class="image-product" src=${item.photo} alt="Foto do ${item.name}">
      <div class="content-product" >
        <h3>${item.name}</h3>
        <span>R$ ${item.price}</span>
      </div>
      <div class="options-product" >
        <button>
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#fff"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z"/></svg>
        </button>
        <input type="number" name="qtd">
        <button>
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#fff"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>

</button>
      </div>
      `
    );
  });
};

document.querySelectorAll("#shop").forEach(async (page) => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  let hashName = window.location.hash;
  console.log(hashName);
  if (hashName) {
    hashName = hashName.substring(1);
    const snapshot = await db
      .collection("companies")
      .where("rash", "==", hashName)
      .get();

    if (snapshot.empty) return;

    const company = [];
    console.log(snapshot);
    snapshot.forEach((item) => {
      company.push(item.data());
    });
    console.log(company[0]);

    const companyName = document.querySelector("#company h1");
    const companySlogam = document.querySelector("#company > span");
    const logo = document.querySelector("#logo-icon");

    logo.src = company[0].photo;
    companyName.innerHTML = company[0].name;
    companySlogam.innerHTML = company[0].message;

    const products = await db
      .collection("products")
      .where("companyId", "==", company[0].userId)
      .get();

    const productData = [];

    products.forEach((item) => {
      const product = item.data();
      if (product.is_online) {
        productData[item.id] = product
        productData.push(item.data())
      }
      console.log("product", product.is_online, productData );
    });

    console.log("product",  productData );
    await renderProducts(page.querySelector("#products"), productData);
    sessionStorage.setItem("products", JSON.stringify(productData));
    console.log(JSON.parse(sessionStorage.getItem("products")))

    const body = document.querySelector("body");
    body.classList.remove("loading");
    body.style = `background-color: ${company[0].main_color}`;
    document.querySelectorAll("button").forEach((btn) => {
      btn.style = `background-color: ${company[0].second_color}`;
    });
  } else {
    console.log("sem hash");
    setTimeout(() => {
      window.location.href = '/products.html'
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
