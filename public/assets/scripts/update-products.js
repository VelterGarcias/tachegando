import Cropper from "cropperjs";
import IMask from "imask";
import Cookies from "js-cookie";

import firebase from "./firebase-app";
import {
  showAlert,
  getFormValues,
  setFormValues,
  getQueryString,
  showModal,
  appendTemplate,
  formatCurrency,
} from "./utils";

//======================== Atualizar Dados ====================================
document.querySelectorAll("#form-product").forEach((form) => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  let cropper = null;
  let userGlobal = null;
  const imageElement = document.querySelector("#photo-preview");
  const buttonElement = document.querySelector(".choose-photo");

  const inputFileElement = document.querySelector("#file");
  const btnSubmit = form.querySelector("[type=submit]");

  const productDate = [];
  const { produto } = getQueryString();
  

  // new IMask(inputPhone, {
  //   mask: "(00) [0]0000-0000)",
  // });

  // new IMask(inputCep, {
  //   mask: "00000-000",
  // });

  const bodyElement = document.body;

  const uploadFile = (files) => {
    if (files) {
      const file = files[0];

      buttonElement.disabled = true;

      const reader = new FileReader();

      reader.onload = () => {
        imageElement.src = reader.result;

        form.classList.add("cropping");

        cropper = new Cropper(imageElement, {
          aspectRatio: 1 / 1,
        });
      };

      reader.readAsDataURL(file);

      buttonElement.disabled = false;
    }
  };

  const updateBtnRemove = () => {
    const btnRemoveOption = document.querySelectorAll("#modal .btn-remove");

    btnRemoveOption.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const optionRemoved = e.currentTarget;
        optionRemoved.closest('li').remove();
      });
    });
  }

  const editProductOptions = (productData) => {

    let product = productData
    let options = ""
    if (!product) {
      product = {
        id: 0,
        max: '',
        min: '',
        "option-title": ''
      }
      options = `
              <li class="row">
                <input type="text" name="option" placeholder="Nome da Opção" />
                <button type="button" class="btn-remove">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="black"></path>
                </svg>
                </button>
                <input type="text" name="price" placeholder="R$" >
            
              </li>
              `
    } else {
      productData.options.forEach(({option, price}) => {


        options += `
                  <li class="row">
                    <input type="text" name="option" value="${option}" />
                    <button type="button" class="btn-remove">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="black"></path>
                    </svg>
                    </button>
                    <input type="text" name="price" placeholder="R$" value="${price}" >
                
                  </li>
                  `
        
      });
    }

    const contentModal =`
        <form>
          <ul class="options">
            <input type="hidden"  name="id" value="${product.id}" />
            <label class="title" for="option-title">Título do Adicional</label>
            <div class="row">  
              <input type="text"  name="option-title" placeholder="Nome do Adicional" value="${product["option-title"]}" />
            </div>
            <div class="row">  
              <div>
                <label for="min">Mínimo</label>
                <input type="number"  name="min" value="${product.min}" />
              </div>
              <div>
                <label for="max">Máximo</label>
                <input type="number"  name="max" value="${product.max}" />
              </div>
            </div>
            ${options}
          </ul>
          <button type="button" class="btn-add">Nova Opção</button>
          <footer >
            <button type="button" class="close" >Cancelar</button>
            <button type="submit" >Salvar</button>
          </footer>
        </form>
      `;

    showModal(contentModal);

    const btnAddOption = document.querySelector("#modal .btn-add");

    btnAddOption.addEventListener("click", () => {

      // const newIndex = document.querySelectorAll("#modal .options li")

      appendTemplate(
        document.querySelector("#modal .options"),
        `li class="row"`,
        `
        <input type="text" name="option" placeholder="Nome da Opção" />
        <button type="button"class="btn-remove">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="black" />
      </svg>
        </button>
        <input type="text" name="price" placeholder="R$"/>
        `
      );

      updateBtnRemove();
    });

    const saveFormOptions = document.querySelector("#modal form");

    saveFormOptions.addEventListener('submit', (e) => {
      e.preventDefault();
      const dataAditional = getFormValues(saveFormOptions);
      // console.log("dataAditional", dataAditional);
      const optionsLi = saveFormOptions.querySelectorAll('li')
      const options = []
      optionsLi.forEach(li => {
        let dataOpt = getFormValues(li);
        if(dataOpt.price == '') {
          dataOpt.price = 0;
        } else {
          // console.log(dataOpt.price.replace(",", "."))
          dataOpt.price = dataOpt.price.replace(",", ".");
        }
        options.push(dataOpt);
      });

      dataAditional.options = options;
      delete dataAditional.option;
      delete dataAditional.price;

      const  oldAditionals = Cookies.getJSON("aditionals")
      let newAditionals = oldAditionals ? oldAditionals : []
      
      if (dataAditional.id == 0) {
        delete dataAditional.id;
        dataAditional.companyId = userGlobal.uid;

        if (newAditionals.length > 0) {
          newAditionals.push(dataAditional)
        } else {
          newAditionals = [dataAditional]
        }
        
        // Cookies.set("aditionals", newAditionals, { expires: 1 });

        db.collection("aditionals")
          .add({dataAditional})
          .then((res) => {
            const product = Cookies.getJSON("product")
            let aditionals = []
            if (product.aditionals) {
              aditionals = [...product.aditionals, res.id]
            } else {
              aditionals = [res.id]
            }
            return db.collection("products").doc(produto).update({aditionals})
          })
          .then(() => showAlert("Adicional salvo com sucesso"))
          .catch((err) => {
            // console.log(err);
            showAlert(err.message, true);
          })
          
      } else {

        dataAditional.companyId = userGlobal.uid;

        // console.log("dataAditional", dataAditional);
        // console.log("newAditionals", newAditionals);

        db.collection("aditionals")
          .doc(dataAditional.id)
          .set({dataAditional})
          .then(() => showAlert("Adicional salvo com sucesso"))
          .catch((err) => {
            // console.log(err);
            showAlert(err.message, true);
          })

        

        // let oldProductData = Cookies.getJSON("product")
      
        // if (oldProductData.nextProductId) {
        //   const idExists = oldProductData.aditionals.findIndex((product) => product.id === dataAditional.id)
        //   if (idExists >= 0) {
        //     oldProductData.aditionals[idExists] = dataAditional
        //   } else {
        //     oldProductData.aditionals.push(dataAditional)
        //   }
        //   oldProductData.nextProductId = ++oldProductData.nextProductId
          
        // } else {
        //   oldProductData.nextProductId = 2
        //   oldProductData.aditionals = [dataAditional]
        // }

        // firebaseUpdateProduct(oldProductData);

      }

      const modal = document.querySelector("#modal");
      modal.classList.remove("open");
      modal.innerHTML = "";
      
    })

    updateBtnRemove();
  };

  const showAditionalsOptions = async () => {

    let allAditionals = []
    const getAditionals = await db.collection("aditionals").where("dataAditional.companyId", "==", userGlobal.uid).get();

    getAditionals.forEach((item) => {
      let data = item.data();
      data = data.dataAditional;
      data.id = item.id;
      allAditionals.push(data);
    });
    

    let aditionalsOptions = ""
    // if (!product) {
    //   product = {
    //     id: 0,
    //     max: '',
    //     min: '',
    //     "option-title": ''
    //   }
    //   options = `
    //           <li class="row">
    //             <input type="text" name="option" />
    //             <button type="button" class="btn-remove">
    //             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    //             <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="black"></path>
    //             </svg>
    //             </button>
    //             <input type="text" name="price" placeholder="R$" >
            
    //           </li>
    //           `
    // } else {
      let aditionals = Cookies.getJSON("aditionals")
      if (!aditionals) aditionals = []

      // console.log("allAditionals", allAditionals);
      // console.log("aditionals", aditionals);


      if (allAditionals) {
        allAditionals.forEach((aditional, i) => {

          

          aditionalsOptions += `
          <div class="row" >
            <input type="checkbox" name="aditionals" id="${aditional.id}" value="${aditional.id}" ${aditionals.find((item) => item.id === aditional.id) ? "checked" : ''} />
            <label for="${aditional.id}" >${aditional["option-title"]}</label>
          </div>
          
                    `
          
        });
      }

    const contentModal =`
        <form class="form-new-aditional">
            <h3>Escolha os adicionais deste produto</h3>
            ${aditionalsOptions}
          <button type="button" class="new-additional">Novo Adicional</button>
          <footer >
            <button type="button" class="close" >Cancelar</button>
            <button type="submit" >Salvar</button>
          </footer>
        </form>
      `;

    showModal(contentModal);


    document.querySelector(".new-additional").addEventListener("click", (e) => {
      editProductOptions();
    });


    const saveFormOptions = document.querySelector("#modal form");

    saveFormOptions.addEventListener('submit', (e) => {
      e.preventDefault();
      const oldAditionals = Cookies.getJSON("aditionals")
      const {aditionals} = getFormValues(saveFormOptions)
      
      // console.log(oldAditionals, oldAditionals.map(a => a.id) , aditionals);
      console.log(aditionals);

      db.collection("products")
      .doc(produto)
      .update({ aditionals: aditionals })
      .then(() => {
        if (!aditionals.length) {
          renderProductOptions(aditionals);
          Cookies.set("aditionals", aditionals, { expires: 1 });
        }
        showAlert("Alterações salvas com sucesso!");
      })
      .catch((err) => {
        // console.log(err);
        showAlert(err.message, true);
      });

      const modal = document.querySelector("#modal");
      modal.classList.remove("open");
      modal.innerHTML = "";
      
    })

    updateBtnRemove();
  };


  const renderProductOptions = (product) => {
    const divOptions = document.querySelector("#options");
    divOptions.innerHTML = ""
    
    appendTemplate(divOptions, 'h3', 'Opções Adicionais')

    if (product) {
      product.forEach(item => {
        let options = ""
        item.options.forEach(({option, price}) => {
  
          options += `
                    <li class="row">
                      ${option}
                      <span>+ ${formatCurrency(price)}</span>
                    </li>
                    `
          
        });
  
        appendTemplate(
          divOptions,
          'ul',
          `
            <div>
              <h4 class="option-title">${item["option-title"]}</h4>
              <button class="btn-edit" data-id="${item.id}">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path
                    d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
                </svg>
              </button>
              <button type="button" class="btn-remove" data-id="${item.id}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="black"></path>
                </svg>
              </button>
              <div class="min-max row" >
                <span>Minimo: ${item.min}</span>
                <span>Máximo: ${item.max}</span>
              </div>
              
            </div>
            ${options}  
          `
        )
        
      });
    }
    

    appendTemplate(
      divOptions,
      'div',
      `<button type="button" id="choose-additional">Novo Adicional</button>`
    )

    document.querySelector("#choose-additional").addEventListener("click", (e) => {
      showAditionalsOptions();
    });
      
  }

  const renderProductValue = () => {

    const productData = Cookies.getJSON("product")
    setFormValues(form, productData);  

    const aditionals = Cookies.getJSON("aditionals")
    if (aditionals) {

      renderProductOptions(aditionals);

      [...document.querySelectorAll(".btn-edit")].forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = aditionals.findIndex((aditional) => aditional.id === btn.dataset.id)
          // const data = aditionals.filter(aditional => aditional.id === btn.dataset.id)
          // console.log("data-btn", aditionals[id]);
          editProductOptions(aditionals[id]);
        })
      });

      [...document.querySelectorAll(".btn-remove")].forEach(btn => {
        btn.addEventListener("click", (e) => {
          
          deleteAditional(btn.dataset.id, productData.aditionals)
          
        })
      });


    } else {
      renderProductOptions();
    }
    

    

    

  }

  function deleteAditional(id, allAditionals, withoutModal) {
    const aditionalsFilter = allAditionals.filter(
      (aditional) => aditional !== id
    );
    
    if (withoutModal) {
      
        db.collection("products")
        .doc(produto)
        .update({ aditionals: aditionalsFilter })
        .catch((err) => {
          // console.log(err);
          showAlert(err.message, true);
        });

    } else {
        showModal(`
          <div class="modal-alert">
            <h3>De onde deseja EXCLUIR essa opção?</h3>
            <p>
              <button id="btn-delete-only">Apenas neste produto</button>
              <button id="btn-delete" class="danger" >Excluir Totalmente</button>
              <button id="btn-cancel" class="cancel" >Cancelar</button>
            </p>
          </div>
          
        `);

          const btnCancel = document.querySelector("#btn-cancel");
          const btnDelete = document.querySelector("#btn-delete-only");
          const btnDeleteTotal = document.querySelector("#btn-delete");
    
          btnCancel.addEventListener("click", () => {
            modal.classList.remove("open");
          });
    
          btnDelete.addEventListener("click", () => {
            // console.log(produto, aditionalsFilter);
            // console.log(productDate);
            db.collection("products")
            .doc(produto)
            .update({ aditionals: aditionalsFilter })
            .then(()=>{
              // console.log("renderProductOptions");
              if(!aditionalsFilter.length) {
                renderProductOptions(aditionalsFilter);
                Cookies.set("aditionals", aditionalsFilter, { expires: 1 });
              }
            })
            .catch((err) => {
              // console.log(err);
              showAlert(err.message, true);
            });
            modal.classList.remove("open");
          });

          btnDeleteTotal.addEventListener("click", () => {
            db.collection("aditionals")
            .doc(id)
            .delete()
            .then(() => {
              showAlert("Opção EXCLUIDA com sucesso")
              renderProductOptions(aditionalsFilter);
              Cookies.set("aditionals", aditionalsFilter, { expires: 1 });
            })
            .catch((err) => {
              // console.log(err);
              showAlert(err.message, true);
            });
            modal.classList.remove("open");
            modal.innerHTML = "";
          });
    }
    
  }

  auth.onAuthStateChanged(async (user) => {
    // console.log(user);
    if (user) {
      userGlobal = user;

      db.collection("products")
        .doc(produto)
        .onSnapshot((snapshot) => {
          productDate.length = 0;

          productDate.push(snapshot.data());

          imageElement.src = productDate[0].photo || "./assets/images/product.svg";
          Cookies.set("product", ...productDate, { expires: 1 });
          // console.log("productDate", productDate);
          let aditionals = []
          if (productDate[0].aditionals) {

            if (!productDate[0].aditionals.length) renderProductValue();

            productDate[0].aditionals.forEach((aditionalId, i) => {
              // console.log("aditionalId", aditionalId);
              db.collection("aditionals")
              .doc(aditionalId)
              .onSnapshot((snapshot) => {
                const data = snapshot.data()
                if (data) {
                  const {dataAditional} = data
                  dataAditional.id = snapshot.id
                  const indexExistis = aditionals.findIndex((product) => product.id === snapshot.id)
                  if (indexExistis === -1) {
                    aditionals.push(dataAditional);
                  } else {
                    aditionals[indexExistis] = dataAditional
                  }
                  Cookies.set("aditionals", aditionals, { expires: 1 });
                } else {
                  deleteAditional(aditionalId, productDate[0].aditionals, true)
                }
                renderProductValue();
              });
            });

          } else {
            Cookies.remove("aditionals");
            renderProductValue();
          }

        });
        
        
    } else {
      auth.signOut();
      window.location.href = "/login.html";
    }
  });

  bodyElement.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadFile(e.dataTransfer.files);
  });
  bodyElement.addEventListener("dragover", (e) => e.preventDefault());

  //================== Salvando os dados =================
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = "Salvando...";

    const productData = getFormValues(form);
    // console.log("productData", productData)
    productData.photo = imageElement.src;
    productData.companyId = userGlobal.uid;
    productData.price = productData.price.replace(",", ".");

    db.collection("products")
      .doc(produto)
      .update(productData)
      .then(() => showAlert("Produto salvo com sucesso"))
      .catch((err) => {
        // console.log(err);
        showAlert(err.message, true);
      })
      .finally(() => {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = "Salvar";
      });
  });

  imageElement.addEventListener("click", (e) => {
    buttonElement.click();
  });

  buttonElement.addEventListener("click", (e) => {
    if (cropper) {
      imageElement.src = cropper.getCroppedCanvas({'width': 350, 'height': 350}).toDataURL("image/png");

      cropper.getCroppedCanvas({'width': 350, 'height': 350}).toBlob((blob) => {
        const storage = firebase.storage();

        const fileRef = storage
          .ref()
          .child(`photos/${userGlobal.uid}/${produto}.png`);

        fileRef
          .put(blob)
          .then((snapshot) => snapshot.ref.getDownloadURL())
          // .then((photoURL) => userGlobal.updateProfile({ photoURL }))
          .then((photo) => {
            db.collection("products").doc(produto).update({ photo: photo });

            imageElement.src = photo;
            showAlert("A sua foto foi atualizada");
          });

        cropper.destroy();

        cropper = null;

        form.classList.remove("cropping");
      });

      btnSubmit.disabled = false;
      buttonElement.innerHTML = "Escolher foto";
    } else {
      btnSubmit.disabled = true;
      buttonElement.innerHTML = "Salvar nova foto";
      inputFileElement.click();
    }
  });

  inputFileElement.addEventListener("change", (e) => {
    uploadFile(e.target.files);
    e.target.value = "";
  });
});
