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

const renderIngredientsOptions = (context, ingredientsOptions) => {
  const targetElement = context.querySelector("#ingredients");

  targetElement.innerHTML = "";

  ingredientsOptions.forEach((item) => {
    appendTemplate(
      targetElement,
      "li",
      `
          <label>
          <input type="checkbox" name="item" value="${item.id}" />
          <span></span>
          <h3>${item.name}</h3>
          <div>${formatCurrency(item.price)}</div>
          </label>
      `
    );
  });
};

document.querySelectorAll("#burguer").forEach(async (page) => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  let hashName = window.location.hash
  console.log(hashName);
  if (hashName) {
    hashName = hashName.substring(1)
    const snapshot = await db.collection("companies").where("rash", "==", hashName).get();

    if (snapshot.empty) return
    const company = [];
    console.log(snapshot);
    snapshot.forEach((item) => {
      company.push(item.data());
    });
    console.log(company[0]);

    const companyName = document.querySelector("#company h1");
    const companySlogam = document.querySelector("#company > span");
    const logo = document.querySelector("#logo-icon");

    logo.src = company[0].photo
    companyName.innerHTML = company[0].name
    companySlogam.innerHTML = company[0].message
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
