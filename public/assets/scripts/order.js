import { appendTemplate, formatCurrency, showAlert } from "./utils";
import Cookies from "js-cookie";

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