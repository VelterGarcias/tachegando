import firebase from "./firebase-app";
import IMask from "imask";
import Cookies from "js-cookie";
import { formatCurrency, getFormValues, renderOrderList, saveOrder, setFormValues, showAlert } from "./utils";

const setInstallmentsOptions = (input, order) => {
  let totalPrice = 0;

  order.forEach((burger) => {
    totalPrice += burger.total;
  });

  let numberOfInstallments = 6;

  const price = totalPrice;

  for (let i = numberOfInstallments; i >= 1; i--) {
    if (price / i < 10) {
      continue;
    } else {
      numberOfInstallments = i;
      break;
    }
  }

  input.innerHTML = "";

  for (let i = 1; i <= numberOfInstallments; i++) {
    const option = document.createElement("option");
    option.innerHTML = `${i}x de ${formatCurrency(
      totalPrice / i
    )} (${formatCurrency(totalPrice)})`;
    option.value = i;
    input.appendChild(option);
  }
};

const getBankList = (input) => {
  const database = firebase.firestore();

  database
    .collection("banks")
    .orderBy("bankName", "asc")
    .onSnapshot((snapshot) => {
      input.innerHTML = "";

      const bankList = [];

      snapshot.forEach((bank) => {
        bankList.push(bank.data());
      });

      bankList.forEach((bank) => {
        const option = document.createElement("option");
        option.innerHTML = bank.bankName;
        option.value = bank.bankCod;
        input.appendChild(option);
      });
    });
};

const validateForm = (data) => {
  for (let key in data) {
    if (data[key].trim() === "") {
      showAlert("Preencha todos os campos para prosseguir", true);
      return false;
    }
  }

  if (data.number.length < 16) {
    showAlert("O número do cartão de crédito deve conter 16 dígitos", true);
    return false;
  }
  else if (data.code < 3) {
    showAlert("O código de segurança deve conter ao menos 3 dígitos", true);
    return false;
  }
  else if (data.validate.length < 5) {
    showAlert("A data de validade do cartão deve conter 4 dígitos", true);
    return false;
  }
  else {
    const month = data.validate.split('/')[0];
    const year = data.validate.split('/')[1];
    const currentYear = new Date().getFullYear().toString().substr(-2);
    const currentMonth = new Date().getMonth() + 1;

    if (year < currentYear) {
      showAlert("A data de validade do cartão é inválida", true);
      return false;
    }
    else if (year == currentYear) {
      if (month < currentMonth || month > 12) {
        showAlert("A data de validade do cartão é inválida", true);
        return false;
      }
    }
    
    return true;
  }
}

const submitForm = (form) => {

    const dataForm = getFormValues(form);
    console.log(dataForm);
    Cookies.set('user', dataForm)
    const { phone, name } = Cookies.getJSON("company")

    let whats = phone.replace('(', '')
    whats = phone.replace(')', '')
    whats = phone.replace(' ', '')
    whats = phone.replace('-', '')

    const order = Cookies.getJSON("order")

    const msgHeader = 
`
🆃🅰🅲🅷🅴🅶🅰🅽🅳🅾%0A %0A
*${name}*%0A
............................................................%0A
𝓟𝓮𝓭𝓲𝓭𝓸 𝓯𝓮𝓲𝓽𝓸 𝓹𝓸𝓻:%0A
*${dataForm.name}*%0A
............................................................%0A
`
    let messageBody = ''

    
    let total = 0;
    order.forEach((item,i) => {
      let msgItem = 
`
%0A
❍ *${item.name}*: ${formatCurrency(item.price)} %0A
`

      if(!item.details.empty) {
        item.details.forEach(detail => {
          let items = ''
          detail.items.forEach(detailItem => {
            const [name] = detailItem.split('=')
            items = items + `      - ${name}%0A`
          })
          msgItem = msgItem + `    ${detail.title}:%0A${items}`
        });
      }

      // if(!item.details.empty) {
      //   item.details.forEach((detail) => {
      //     msgItem = msgItem + `${detail.name} - ${detail.price} %0A`
      //   })
      // }
      messageBody = messageBody + msgItem
      total += Number(item.price)
    });

    const msgFooter = 
`%0A
............................................................%0A
𝙏𝙤𝙩𝙖𝙡 𝙙𝙤 𝙥𝙚𝙙𝙞𝙙𝙤: *${formatCurrency(total)}*%0A
`

    const msgAdress = 
`
............................................................%0A %0A %0A
*Endereço de Entrega:*%0A
${dataForm.adress}, ${dataForm.number}%0A
${dataForm.complement ? dataForm.complement + '%0A': ''}
${dataForm.district} - ${dataForm.city}%0A
${dataForm.cep ? 'CEP: ' + dataForm.cep : ''} %0A
`

    const msg = msgHeader + messageBody + msgFooter + msgAdress

    console.log(msg);

    window.location.href = `https://api.whatsapp.com/send/?phone=55${whats}&text=${msg}`;

    
};

const payment = document.querySelector("#payment");

if (payment) {
  const btnPay = document.querySelector("#btn-pay-order");
  const form = payment.querySelector("form");

  const user = Cookies.getJSON("user");
  console.log(user);
  if (user) setFormValues(form, user)

  // const inputCardNumber = form.querySelector('[name="number"]');
  // const inputValidate = form.querySelector('[name="validate"]');
  // const inputCvvCode = form.querySelector('[name="code"]');
  // const inputBanks = form.querySelector('[name="bank"]');
  // const inputInstallments = form.querySelector('[name="installments"]');

  // new IMask(inputCardNumber, {
  //   mask: "0000 0000 0000 0000",
  // });

  // new IMask(inputValidate, {
  //   mask: "00/00",
  // });

  // new IMask(inputCvvCode, {
  //   mask: "000[0]",
  // });

  // const order = JSON.parse(sessionStorage.getItem("order")) || [];

  // if (order.length < 1) {
  //   showAlert("Não possui nenhum pedido", true);
  //   setTimeout(() => {
  //     window.location.href = "/";
  //   }, 4000);
  // } else {
  //   setInstallmentsOptions(inputInstallments, order);
  //   getBankList(inputBanks);
  // }

  renderOrderList()

  btnPay.addEventListener("click", (e) => {
    form.querySelector('button[type="submit"]').click();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitForm(form);
  });


}
