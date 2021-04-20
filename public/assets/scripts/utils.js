import Cookies from "js-cookie";

export function getFormValues(form) {
  const values = {};

  form.querySelectorAll("[name]").forEach((field) => {
    // console.log(field.name, field.value, field.type);
    switch (field.type) {
      case "select":
        values[field.name] = field.querySelector("option:selected")?.value;
        break;

      case "radio":
        values[field.name] = form.querySelector(
          `[name=${field.name}]:checked`
        )?.value;
        break;

      case "checkbox":
        if (field.name.startsWith("is")) {
          if (form.querySelector(`[name=${field.name}]:checked`)) {
            values[field.name] = true;
          } else {
            values[field.name] = false;
          }
        } else {
          values[field.name] = [];
          form
            .querySelectorAll(`[name=${field.name}]:checked`)
            .forEach((checkbox) => {
              values[field.name].push(checkbox.value);
            });
        }
        break;

      default:
        values[field.name] = field.value;
        break;
    }
  });
  //console.log(values);
  return values;
}

export function setFormValues(form, values) {
  Object.keys(values).forEach((key) => {
    const field = form.querySelector(`[name=${key}]`);
    if (field) {
      switch (field.type) {
        case "select":
          field.querySelector(`option[value=${values[key]}]`).selected = true;
          break;

        case "radio":
        case "checkbox":
          if (field.name.startsWith("is")) {
            form.querySelector(`[name=${key}]`).checked = values[key];
          } else {
            form.querySelector(
              `[name=${key}][value="${values[key]}"]`
            ).checked = true;
          }

          break;
        case "file":
          break;
        default:
          field.value = values[key];
          break;
      }
    }
  });
}

export function showAlertError() {
  return (error) => {
    const alertDanger = document.querySelector("#alert");
    alertDanger.innerHTML = error.message;
    alertDanger.classList.add("danger");
    alertDanger.classList.remove("hide");
    //console.log(error);

    hideAlert(alertDanger);

    // setTimeout(() => {
    //   alertDanger.classList.add("hide");
    // }, 3000);
  };
}

export function showAlert(message, danger = false) {
  const alertDanger = document.querySelector("#alert");
  alertDanger.innerHTML = message;

  if (danger) {
    alertDanger.classList.add("danger");
  } else {
    alertDanger.classList.remove("danger");
  }

  alertDanger.classList.remove("hide");
  // console.log(message);

  hideAlert(alertDanger);
}

export function hideAlert(alert) {
  // const alertDanger = document.querySelector("#alert");
  setTimeout(() => {
    alert.classList.add("hide");
  }, 3500);
  // console.log(error);
}

export function getQueryString() {
  const queryString = {};

  if (window.location.search) {
    window.location.search
      .split("?")[1]
      .split("&")
      .forEach((param) => {
        param = param.split("=");

        queryString[param[0]] = decodeURIComponent(param[1]);
      });
  }

  //console.log(queryString);

  return queryString;
}

export function appendTemplate(element, tag, html) {
  const [tagName, ...tagAtribute] = tag.split(" ");
  const wrapElement = document.createElement(tagName);

  wrapElement.innerHTML = html;
  tagAtribute.forEach((atribute) => {
    const [atributeName, atributeValue] = atribute.split("=");
    let atributeValueFormated = atributeValue
      .replace(/^"|"$/g, "")
      .replace(/^'|'$/g, "");
    wrapElement.setAttribute(atributeName, atributeValueFormated);
  });

  element.append(wrapElement);

  return wrapElement;
}

export function onSnapshotError(err) {
  showAlertError()(err);
  console.error(err);
  setTimeout(() => {
    // window.location.href = "/login.html";
  }, 2000);
}

export function formatCurrency(value) {
  return parseFloat(value).toLocaleString("pt-br", {
    style: "currency",
    currency: "BRL",
  });
}

export async function saveOrder(db, order) {
  let orderLatestId;

  const getMax = await db
    .collection("orders-teste")
    .orderBy("order_id", "desc")
    .limit(1)
    .get();

  getMax.forEach((doc) => {
    orderLatestId = doc.data();
    // console.log("max", '=>', doc.data());
  });
  if (!orderLatestId) {
    orderLatestId = 5000;
  } else {
    orderLatestId = orderLatestId.order_id + 1;
  }

  order.order_id = orderLatestId;

  //=============== Salvar o pedido ==============================
  db.collection("orders-teste")
    .add(order)
    .then((res) => {
      sessionStorage.removeItem("order");
      window.location.href = "/orders.html";
    });
}

export function showModal(content) {
  const modal = document.querySelector("#modal");
  modal.innerHTML = "";
  modal.classList.add("open");
  appendTemplate(
    modal,
    "div",
    `<div id="overlay" class="close"></div><div class="modal-content"><img class="close" src="assets/images/close.svg" alt="Fechar" />${content}</div>`
  );

  const closeBtn = modal.querySelectorAll(".close");

  [...closeBtn].forEach((close) => {
    close.addEventListener("click", () => {
      modal.classList.remove("open");
      modal.innerHTML = "";
    });
  });
}

export function showMenu(content) {
  const menu = document.querySelector("#userMenu");
  menu.innerHTML = "";
  menu.classList.add("open");
  appendTemplate(menu, "div", content);

  const closeBtn = menu.querySelector("img");

  closeBtn.addEventListener("click", () => {
    menu.classList.remove("open");
  });
}

export function getOrderId(btn) {
  const cardOrder = btn.closest(".actions");
  return cardOrder.id;
}

export function  renderOrderList() {
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

export function setRemoveBuguerButtonEvent(list) {
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

