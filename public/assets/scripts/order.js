import { appendTemplate, formatCurrency, showAlert } from "./utils";
import Cookies from "js-cookie";

// const page = document.querySelector("#burguer");
// const btnSaveBurguer = document.querySelector("#btnSaveBurguer");
const btnGoToPayment = document.querySelector("#btn-pay");

let order = [];

if (btnGoToPayment) {

  btnGoToPayment.addEventListener("click", (e) => {
    
    if (Cookies.getJSON("order")) {
      if (Cookies.getJSON("order").length > 0) {
        window.location.href = '/pay.html'
      }
      else {
        showAlert("Adicione ao menos um produto para prosseguir!", true);
      }
    }
     else {
      showAlert("Adicione ao menos um produto para prosseguir!", true);
    }
    
  });

  
}

//   btnSaveBurguer.addEventListener("click", (e) => {
//     const breadList = page.querySelectorAll("#breads [type=radio]");
//     const ingredientsList = page.querySelectorAll(
//       "#ingredients [type=checkbox]"
//     );

//     const breadListFromSession = JSON.parse(
//       sessionStorage.getItem("breadOptions")
//     );
//     const ingredientsListFromSession = JSON.parse(
//       sessionStorage.getItem("ingredientsOptions")
//     );

//     // console.log(breadList, ingredientsList);

//     let ingredients = [];
//     let bread = {};
//     let total = 0;

//     breadList.forEach((item) => {
//       if (item.checked) bread.id = item.value;

//       item.checked = false;
//     });

//     ingredientsList.forEach((item) => {
//       if (item.checked) {
//         ingredientsListFromSession.forEach((option) => {
//           if (+option.id == +item.value) {
//             total += +option.price;

//             ingredients.push({
//               id: item.value,
//               price: option.price,
//               name: option.name,
//             });
//           }
//         });
//       }

//       item.checked = false;
//     });

//     if (!bread.id || ingredients.length < 1) {
//       showAlert(
//         "Por favor, selecione ao menos um tipo de pão e um ingrediente",
//         true
//       );
//       return;
//     }

//     breadListFromSession.forEach((item) => {
//       if (+item.id == +bread.id) {
//         bread.name = item.name;
//         bread.price = item.price;
//         total += +item.price;
//       }
//     });

//     order.push({
//       id: order.length + 1,
//       ingredients,
//       bread,
//       total,
//     });

//     sessionStorage.setItem("order", JSON.stringify(order));

//     // console.log(JSON.parse(sessionStorage.getItem('order')))

//     renderOrderList();
//   });

//   const setRemoveBuguerButtonEvent = (list) => {
//     const buttons = list.querySelectorAll("button");

//     buttons.forEach((button) => {
//       button.addEventListener("click", (e) => {
//         const removeBurguerId = button.dataset.burguerId;

//         //console.log(removeBurguerId);

//         order = order.filter((x) => +x.id !== +removeBurguerId);

//         renderOrderList();
//       });
//     });
//   };

//   const renderOrderList = () => {
//     // console.log(order);
//     const menu = document.querySelector("#menu");
//     const targetElement = menu.querySelector("#orderList");

//     targetElement.innerHTML = "";

//     let total = 0;

//     order.forEach((item) => {
//       total += item.total;
//       appendTemplate(
//         targetElement,
//         "li",
//         `
//           <div>Hamburguer ${item.id}</div>
//           <div>${formatCurrency(item.total)}</div>
//           <button type="button" aria-label="Remover Hamburguer ${
//             item.id
//           }" data-burguer-id="${item.id}">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="black" />
//             </svg>
//           </button>
//         `
//       );

//       setRemoveBuguerButtonEvent(targetElement);
//     });

//     menu.querySelector("footer .price span").innerHTML = formatCurrency(total);

//     menu.querySelector("header strong small").innerHTML =
//       order.length < 2
//         ? `${order.length} hamburguer`
//         : `${order.length} hamburguers`;
//   };
// }
