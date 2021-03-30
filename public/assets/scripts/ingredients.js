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

document.querySelectorAll("#burguer").forEach((page) => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  auth.onAuthStateChanged((user) => {
    // console.log(user);
    db.collection("bread").onSnapshot((snapshot) => {
      const breadOptions = [];

      snapshot.forEach((item) => {
        breadOptions.push(item.data());
      });

      sessionStorage.setItem("breadOptions", JSON.stringify(breadOptions));

      renderBreadOptions(page, breadOptions);
    }, onSnapshotError);

    db.collection("ingredients").onSnapshot((snapshot) => {
      const ingredientsOptions = [];

      snapshot.forEach((item) => {
        ingredientsOptions.push(item.data());
      });

      sessionStorage.setItem(
        "ingredientsOptions",
        JSON.stringify(ingredientsOptions)
      );

      renderIngredientsOptions(page, ingredientsOptions);
    }, onSnapshotError);
  });
});
