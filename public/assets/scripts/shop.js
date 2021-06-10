import firebase from "./firebase-app";
import Cookies from "js-cookie";
import {
  appendTemplate,
  onSnapshotError,
  formatCurrency,
  showModal,
  getFormValues,
  renderOrderList,
} from "./utils";

const prod = false;

const renderProducts = (targetElement, productOptions) => {
  targetElement.innerHTML = "";
  const categoryWrapper = document.querySelector('div.category')
  categoryWrapper.innerHTML = "";
  console.log("productOptions", productOptions);

  let categories = [...new Set(productOptions.map(item => item.category))];
  console.log("categories", categories);

  categories.forEach(category => {
    const productsInCategory = productOptions.filter((product) => product.category === category)
    console.log("productsInCategory", productsInCategory);

    

    let listProducts = ''

    productsInCategory.forEach((item) => {
  
      listProducts = listProducts + `
        <li id="category">
          <div id=${item.id} class="content">
            <img class="image-product" src=${item.photo} alt="Foto do ${item.name}">
            <div class="data-product" >
              <h3>${item.name}</h3>
              <span>${formatCurrency(item.price)}</span>
            </div>
          </div>
          <div class="options-product" >
            <button class="add-product second" data-id="${item.id}">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
            </button>
          </div>
        </li>
        `
    });

    appendTemplate(
      categoryWrapper,
      "div",
      `
      <h2>${category}</h2>
      <ul>
      ${listProducts}
      </ul>
      `
    );

    // productsInCategory.forEach((item) => {
    //   appendTemplate(
    //     targetElement,
    //     "li",
    //     `
    //     <div id=${item.id} class="content">
    //       <img class="image-product" src=${item.photo} alt="Foto do ${item.name}">
    //       <div class="data-product" >
    //         <h3>${item.name}</h3>
    //         <span>${formatCurrency(item.price)}</span>
    //       </div>
    //     </div>
    //     <div class="options-product" >
    //       <button class="add-product" data-id="${item.id}">
    //         <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
    //       </button>
    //     </div>
    //     `
    //   );
    // });


  })

  
};

const addOrder = (data) => {
    
      // console.log(e.currentTarget);
      // console.log("data", data);
      // let details = []
      // if (!data.details.empty) {
      //   data.details.forEach(detail => {
      //     const [name, price] = detail.split('=')
      //     details.push({name, price})
      //   });
      // }
      // const newOrder = {
      //   name: data.name,
      //   price: data.total,
      //   photo: data.photo,
      //   details
      // };

      // console.log(details);
      const oldOrder = Cookies.getJSON("order");
      if (oldOrder) {
        // data.find( product => product.id === idBtn );
        data.id = Number(Cookies.get("nextOrderId"))
        oldOrder.push(data);
        Cookies.set("nextOrderId", ++data.id, { expires: 15 });
        Cookies.set("order", oldOrder, { expires: 15 });
        console.log("aqui1");
      } else {
        data.id = 0;
        Cookies.set("nextOrderId", ++data.id, { expires: 15 });
        Cookies.set("order", [data], { expires: 15 });
        console.log("aqui2");
      }
      renderOrderList();
      console.log("order", Cookies.getJSON("order"));

};

//============= começa os códigos das páginas =================

document.querySelectorAll("#shop").forEach(async (page) => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  let hashName = window.location.hash;
  let allAditionals = []
  console.log(hashName);
  if (hashName) {
    let timeout = 1000;
    hashName = hashName.substring(1);
    let company = Cookies.getJSON("company");

    let download = true;

    if(company) {
      if (company.hash === hashName) {
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
      allAditionals = Cookies.getJSON("allAditionals");
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

      
      const getAditionals = await db.collection("aditionals").where("dataAditional.companyId", "==", company.userId).get();
      if (getAditionals.empty) return;
      getAditionals.forEach((item) => {
        let data = item.data();
        data = data.dataAditional;
        data.id = item.id;
        allAditionals.push(data);
      });
      Cookies.set("allAditionals", allAditionals, { expires: 0.041 });
    }

    const ulProducts = page.querySelector(".category");
    console.log("product", productData);
    renderProducts(ulProducts, productData);

    console.log(Cookies.getJSON("products"));

    const body = document.querySelector("body");
    setTimeout(() => {
      body.classList.remove("loading");
    }, timeout);
    body.style = `background-color: ${company.main_color}`;
    document.querySelectorAll(".main-color").forEach((btn) => {
      btn.style = `background-color: ${company.main_color}`;
    });
    document.querySelectorAll(".second").forEach((btn) => {
      btn.style = `background-color: ${company.second_color}`;
    });


    // ============  click nos produtos e mostrar modal ==============
    ulProducts.querySelectorAll(".content").forEach((item) => {
      item.addEventListener("click", () => {
        const { name, price, description, photo, aditionals } = productData.find(
          (product) => product.id === item.id
        );
        console.log(aditionals);
        let options = ""
        
        if (aditionals) {
          aditionals.forEach((item, i )=> {
            console.log(allAditionals);
            if (!allAditionals.find((aditional) => aditional.id === item)) return;
            const add = allAditionals.find((aditional) => aditional.id === item)


            options += `
                      <div>
                      <h4>${add["option-title"]}</h4>
                      <span>Escolha entre ${add.min} e ${add.max} opções.</span>
                      <ul>
                      `
            add.options.forEach(({option, price}) => {
              options += `
                        <li>
                          <input type="checkbox" id="${option + i}" name='details' value="${option}=${price}" />
                          <label for="${option + i}">${option} <span>+ ${formatCurrency(price)}</span></label>
                        </li>
                        `
            });

            options += `</ul></div>`
            
          });
        }
        
        
        
        showModal(`
            <form id="product-details">
              <input type="hidden" name="name" value="${name}" />
              <input type="hidden" name="photo" value="${photo}" />
              <input type="hidden" name="price" value="${price}" />
              <input type="hidden" name="total" value="${price}" />
              <h3>${name}</h3>
              <img class="image-prod-modal" src=${photo} alt="Imagem do Produto" />
              <span></span>
              <span class="description-prod" >${description}</span>
              <span class="price-prod" ><strong>Valor: ${formatCurrency(price)}</strong></span>
              <div class="options-product" >
                ${options}
              </div>
              <div class="comments-wrapper">
                <label for="comments">Observações:</label>
                <textarea id="comments" name="comments" rows="4"></textarea>
              </div>
              <footer style="background-color: ${company.main_color}" >
                <span id="subtotal" data-subtotal="${price}">Total: ${formatCurrency(price)}</span>
                <button type="submit" style="background-color: ${company.second_color}" >Salvar</button>
              </footer>
            </form>
        `);

        

        const formProductDetails = document.querySelector("#product-details")

        formProductDetails.addEventListener("submit", (e) => {
          e.preventDefault();
          const data = getFormValues(formProductDetails)
          console.log("dataForm", data);

          const productOptions = formProductDetails.querySelectorAll('.options-product > div')
          let details = []
          productOptions.forEach(form => {
            const title = form.querySelector('h4').innerHTML
            const items = getFormValues(form)
              const detailsFormated = {
                title,
                items: [...items.details]
              }
              console.log(items);

              if (detailsFormated.items.length) {
                details.push(detailsFormated)
              }
              
            
            
          });
          console.log("details", details);
          data.details = details;
          addOrder(data);
          const modal = document.querySelector("#modal");
          modal.classList.remove("open");
          modal.innerHTML = "";
        })

        const handleOptions = formProductDetails.querySelectorAll("input[type=checkbox]")

        handleOptions.forEach(input => {
          input.addEventListener("change", () => {
            console.log(input.value.split("=")[1]);
            console.log(input.checked);
            let result = 0
            const totalSpan = formProductDetails.querySelector('#subtotal')

            if (input.checked) {
              result = Number(totalSpan.dataset.subtotal) + Number(input.value.split("=")[1])
            } else {
              result = Number(totalSpan.dataset.subtotal) - Number(input.value.split("=")[1])
            }

            totalSpan.dataset.subtotal = result
            totalSpan.innerHTML = `Total: ${formatCurrency(result)}`
            formProductDetails.querySelector("input[name=total]").value = result
          })
        });
        
      });
    });

    // addOrder(productData);

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



// const addOrder = (data) => {
//   document.querySelectorAll(".add-product").forEach((option) => {
//     option.addEventListener("click", (e) => {
//       // console.log(e.currentTarget);
//       let idBtn = e.currentTarget.dataset.id;
//       const { name, price, photo } = data.find(
//         (product) => product.id === idBtn
//       );
//       const newOrder = {
//         name,
//         price,
//         photo,
//       };
//       const oldOrder = Cookies.getJSON("order");
//       if (oldOrder) {
//         // data.find( product => product.id === idBtn );
//         newOrder.id = Number(Cookies.get("nextOrderId"))
//         oldOrder.push(newOrder);
//         Cookies.set("nextOrderId", ++newOrder.id, { expires: 15 });
//         Cookies.set("order", oldOrder, { expires: 15 });
//       } else {
//         newOrder.id = 0;
//         Cookies.set("nextOrderId", ++newOrder.id, { expires: 15 });
//         Cookies.set("order", [newOrder], { expires: 15 });
//       }
//       renderOrderList();
//       console.log("order", Cookies.getJSON("order"));
//     });
//   });
// };
