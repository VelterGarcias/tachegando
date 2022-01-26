import firebase from "./firebase-app";
import Cookies from "js-cookie";
import {
  appendTemplate,
  onSnapshotError,
  formatCurrency,
  showModal,
  getFormValues,
  renderOrderList,
  showAlert,
  getQueryString,
} from "./utils";


const params = getQueryString();
const prod = !params.test ? true : false;

let company = {};


const scrollToCategory = (id) => {
  // window.scrollTo({top: (document.querySelector(`#cat-${id}`).offsetTop - 50), behavior: 'smooth'})
  document.querySelector(`#cat-${id}`).scrollIntoView({behavior: "smooth"});
}

const renderProducts = (targetElement, productOptions) => {
  targetElement.innerHTML = "";
  const categoryWrapper = document.querySelector('div.category')
  categoryWrapper.innerHTML = "";
  // console.log("productOptions", productOptions);

  let categories = [...new Set(productOptions.map(item => item.category))];
  console.log("categories", categories);

  const wrapMenuCategories = document.querySelector('#menu-categories')

  // categories.sort(function(a, b){
  //     if(a < b) { return -1; }
  //     if(a > b) { return 1; }
  //     return 0;
  // })
  
  if (!company.hasOwnProperty('categoriesOrder')) {
    categories.sort(function(a, b){
        if(a < b) { return -1; }
        if(a > b) { return 1; }
        return 0;
    })
  } else {
    console.log("Empresa já possui categorias organizadas");
    categories = Array.from(new Set(company.categoriesOrder.concat(categories)));
    // console.log("allCategoriesOrdened", allCategoriesOrdened);
  }
  
  let listMenucategories = ''
  categories.forEach((category, indexCategory, array) => {
    const productsInCategory = productOptions.filter((product) => product.category === category)
    // console.log("productsInCategory", productsInCategory);

    listMenucategories = listMenucategories + `<button id="menu-${indexCategory}" class="menu-cat" >${category}</button>`

    let listProducts = ''

    productsInCategory.sort(function(a, b){
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
    })

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
      `div id="cat-${indexCategory}"`,
      `
      <h2>${category}</h2>
      <ul>
      ${listProducts}
      </ul>
      `
    );

    if(++indexCategory === array.length) {
      appendTemplate(wrapMenuCategories, 'div class=row', listMenucategories);

      [...document.querySelectorAll('.menu-cat')].forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.id.split('-')[1]
          scrollToCategory(id);
        })
      })

      let isFixed = false;
      document.addEventListener('scroll', function(e) {
      
        if (window.scrollY > 100) {
          if (!isFixed) {
            document.querySelector('#shop').style = 'padding-top: 43px;'
            wrapMenuCategories.style = 'position:fixed;'
            isFixed = true;
            // console.log(window.scrollY);
          }
        } else {
          if (isFixed) {
            document.querySelector('#shop').style = 'padding-top: 0px;'
            wrapMenuCategories.style = 'position:relative;'
            isFixed = false;
            // console.log(window.scrollY);
          }
        }
      });

    }

  })

  

  
};

const addOrder = (data) => {
    

      const oldOrder = Cookies.getJSON("order");
      if (oldOrder) {
        // data.find( product => product.id === idBtn );
        data.id = Number(Cookies.get("nextOrderId"))
        oldOrder.push(data);
        Cookies.set("nextOrderId", ++data.id, { expires: 15 });
        Cookies.set("order", oldOrder, { expires: 1 });
        // console.log("aqui1");
      } else {
        data.id = 0;
        Cookies.set("nextOrderId", ++data.id, { expires: 15 });
        Cookies.set("order", [data], { expires: 1 });
        // console.log("aqui2");
      }
      renderOrderList();
      // console.log("order", Cookies.getJSON("order"));

};

//============= começa os códigos das páginas =================

document.querySelectorAll("#shop").forEach(async (page) => {
  // const auth = firebase.auth();
  const db = firebase.firestore();

  let hashName = window.location.hash;
  let allAditionals = []
  // console.log(hashName);
  if (hashName) {
    let timeout = 1000;
    hashName = hashName.substring(1);
    company = Cookies.getJSON("company");

    let download = true;

    if(company) {
      if (company.hash === hashName && prod) {
        // console.log("tem", company.name, company);
        download = false;
      } else {
        Object.keys(Cookies.get()).forEach(function(cookie) {
          Cookies.remove(cookie);
        });
      }
    } 
    
    if (download) {
      company = null;
      // console.log("Não tem");

      const snapshot = await db
        .collection("companies")
        .where("hash", "==", hashName)
        .get();

      if (snapshot.empty) return;

      // console.log(snapshot);
      snapshot.forEach((item) => {
        company = item.data();
      });
      // console.log(company);

      Cookies.set("company", company, { expires: 0.5 });
    }
    

    const companyName = document.querySelector("#company h1");
    const companySlogam = document.querySelector("#company > span");
    const logo = document.querySelector("#logo-icon");

    if (company.photo) {
      logo.src = company.photo;
    } else {
      logo.style.display="none"
    }
    
    companyName.innerHTML = company.name;
    document.title = company.name;
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
        // console.log("product", product.is_online, productData);
      });
      // console.log("productData", productData);
      // localStorage.setItem("products", JSON.stringify(productData));
      Cookies.set("products", productData, { expires: 0.041 });

      
      const getAditionals = await db.collection("aditionals").where("dataAditional.companyId", "==", company.userId).get();
      if (getAditionals.empty) {
        // console.log("Sem adicionais")
      } else {
        getAditionals.forEach((item) => {
          let data = item.data();
          data = data.dataAditional;
          data.id = item.id;
          allAditionals.push(data);
        });
        Cookies.set("allAditionals", allAditionals, { expires: 0.041 });
      }
      
    }

    const ulProducts = page.querySelector(".category");
    // console.log("product", productData);
    renderProducts(ulProducts, productData);

    // console.log(Cookies.getJSON("products"));

    const body = document.querySelector("body");
    setTimeout(() => {
      body.classList.remove("loading");
    }, timeout);
    body.style = `background-color: ${company.main_color}`;
    document.querySelector('meta[name="theme-color"]').setAttribute('content',  `${company.main_color}`);
    document.querySelector('meta[name="msapplication-TileColor"]').setAttribute('content',  `${company.main_color}`);
    document.querySelectorAll(".main-color").forEach((btn) => {
      btn.style = `background-color: ${company.main_color}`;
    });
    document.querySelectorAll(".second").forEach((btn) => {
      btn.style = `background-color: ${company.second_color}`;
    });

    console.log("company", company);


    // ============  click nos produtos e mostrar modal ==============
    ulProducts.querySelectorAll(".content").forEach((item) => {

      item.addEventListener("click", () => {
        const { name, price, description, photo, aditionals } = productData.find(
          (product) => product.id === item.id
        );
        // console.log(aditionals);
        let options = ""
        
        if (aditionals) {
          aditionals.forEach((item, i )=> {
            // console.log(allAditionals);
            if (!allAditionals.find((aditional) => aditional.id === item)) return;
            const add = allAditionals.find((aditional) => aditional.id === item)
            // console.log(add)
            let min_Max = `<span>Escolha entre ${add.min} e ${add.max} opções.</span>`
            
            if (add.min == "" && add.max == "" || add.min > add.max || add.max == 0 && add.min == 0) {
              min_Max = `<span>Escolha quantas opções desejar.</span>`
            } else if (add.min == 1 && add.max == 1) {
              min_Max = `<span>Escolha apenas 1 opção.</span>`
            } else if (add.min == add.max) {
              min_Max = `<span>Escolha ${add.max} ${add.max > 1 ? 'opções' : 'opção'}.</span>`
            } else if (add.min == "" || add.min == 0) {
              // if (add.max > 0) {
                min_Max = `<span>Escolha no máximo ${add.max} ${add.max > 1 ? 'opções' : 'opção'}.</span>`
              // } 
            } else if (add.min > 0) {
              if (add.max == "" || add.max == 0) {
                min_Max = `<span>Escolha no mínimo ${add.min} ${add.min > 1 ? 'opções' : 'opção'}.</span>`
              } else if (add.max > 0) {
                min_Max = `<span>Escolha entre ${add.min} e ${add.max} ${add.max > 1 ? 'opções' : 'opção'}.</span>`
              }
            }
            options += ` 
                      <div>
                      <h4>${add["option-title"]}</h4>
                      ${min_Max}
                      <ul data-min="${add.min}" data-max="${add.max}">
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
        // const allCheckboxes = formProductDetails.querySelectorAll('input[type="checkbox"]')
        
        // allCheckboxes.forEach(input => {
        //   input.addEventListener("change", (e) => {
        //     console.log(e.target)
        //   })
        // });

        formProductDetails.addEventListener("submit", (e) => {
          e.preventDefault();
          const data = getFormValues(formProductDetails)
          // console.log("dataForm", data);

          const ulOptions = formProductDetails.querySelectorAll('.options-product > div > ul');
          let minOptions = true;
          ulOptions.forEach(ul => {
            const countAllCheckeds = ul.querySelectorAll("input[type=checkbox]:checked").length;
            if (countAllCheckeds < ul.dataset.min) {
            ul.closest('div').classList.add('error')
            showAlert(`Aqui você deve escolher pelo menos ${ul.dataset.min} ${ul.dataset.min > 1 ? 'opções' : 'opção'} `, true)
            minOptions = false;
            }
          })

          if (minOptions) {

            const productOptions = formProductDetails.querySelectorAll('.options-product > div')
            let details = []
            productOptions.forEach(form => {
              const title = form.querySelector('h4').innerHTML
              const items = getFormValues(form)
                const detailsFormated = {
                  title,
                  items: [...items.details]
                }
                // console.log(items);

                if (detailsFormated.items.length) {
                  details.push(detailsFormated)
                }
                
              
              
            });
            // console.log("details", details);
            data.details = details;
            addOrder(data);
            const modal = document.querySelector("#modal");
            modal.classList.remove("open");
            modal.innerHTML = "";

          } else {
            // console.log("Não deu");
          }
          
        })

        const handleOptions = formProductDetails.querySelectorAll("input[type=checkbox]")

        handleOptions.forEach(input => {
          input.addEventListener("change", () => {
            // console.log(input.value.split("=")[1]);
            // console.log(input.checked);
            
            const ulParent = input.closest('ul')
            ulParent.closest('div').classList.remove('error')
            const countCheckboxesChecked = ulParent.querySelectorAll("input[type=checkbox]:checked").length;

            if (countCheckboxesChecked > ulParent.dataset.max && ulParent.dataset.max > 0) {
              input.checked = false;
              showAlert(`Neste opicional você pode escolher apenas ${ulParent.dataset.max} ${ulParent.dataset.max > 1 ? 'opções' : 'opção'} `, true)

            } else {

              // Códigos para calcular e colocar o valor no TOTAL do Modal
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

            }

            // console.log(countCheckboxesChecked, ulParent.dataset.min, ulParent.dataset.max)

            


          })
        });
        
      });
    });

    // addOrder(productData);

    if(Cookies.getJSON("order")) renderOrderList();
    // console.log(company.is_AppOnline);
    if(company.is_AppOnline || company.is_AppOnline === undefined) {
      // console.log("O App está online!");
    } else {
      Object.keys(Cookies.get()).forEach(function(cookie) {
        Cookies.remove(cookie);
      });

      const btnPay = document.querySelector('#btn-pay');
      btnPay.disabled = true;
      btnPay.style = 'background: #686868;';
      showModal(`
      <div style="margin: 10px 25px;background: #ff00009e;padding: 15px;border-radius: 10px;">
        <h3>Nós não estamos atendendo no momento!</h3>
        <p>Mas você pode continuar montando o seu pedido e assim que estivermos em nosso horário de atendimento você poderá nos enviar o seu pedido.</p>
        <p>Para verificar se já estamos online novamente recarregue a página.</p>
      </div>
      `)
    }

  } else {
    // console.log("sem hash");
    setTimeout(() => {
      window.location.href = "/products.html";
    }, 2000);
  }

 
});

