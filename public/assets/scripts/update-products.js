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
        const optionRemoved = e.currentTarget
        optionRemoved.closest('li').remove();
      });
    });
  }

  const editProductOptions = (productData) => {

    let product = productData
    let options = ""
    if (!product.id) {
      product = {
        id: productData,
        max: '',
        min: '',
        "option-title": ''
      }
      options = `
              <li class="row">
                <input type="text" name="option" />
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
            <label for="option-title">Título do Adicional</label>
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
        <input type="text" name="option" />
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
      const data = getFormValues(saveFormOptions)
      const optionsLi = saveFormOptions.querySelectorAll('li')
      const options = []
      optionsLi.forEach(li => {
        options.push(getFormValues(li));
      });

      data.options = options;
      delete data.option;
      delete data.price;
      let oldProductData = Cookies.getJSON("product")
      
      if (oldProductData.nextProductId) {
        const idExists = oldProductData.aditionals.findIndex((product) => product.id === data.id)
        if (idExists >= 0) {
          oldProductData.aditionals[idExists] = data
        } else {
          oldProductData.aditionals.push(data)
        }
        oldProductData.nextProductId = ++oldProductData.nextProductId
        
      } else {
        oldProductData.nextProductId = 2
        oldProductData.aditionals = [data]
      }

      firebaseUpdateProduct(oldProductData);

      const modal = document.querySelector("#modal");
        modal.classList.remove("open");
        modal.innerHTML = "";
      
    })

    updateBtnRemove();
  };

  const renderProductOptions = (product) => {
    const divOptions = document.querySelector("#options");
    divOptions.innerHTML = ""
    
    appendTemplate(divOptions, 'h3', 'Opções')
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
          <h4 class="option-title">${item["option-title"]}</h4>
          <button class="btn-edit" data-id="${item.id}">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path
                d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
            </svg>
            Editar
          </button>
          <button type="button" class="btn-remove" data-id="${item.id}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="black"></path>
            </svg>
          </button>
          <span>Minimo: ${item.min}</span>
          <span>Máximo: ${item.max}</span>
          ${options}  
        `
      )
      
    });

    appendTemplate(
      divOptions,
      'div',
      `<button type="button" id="new-additional">Novo Adicional</button>`
    )

    document.querySelector("#new-additional").addEventListener("click", (e) => {
      const {nextProductId} = Cookies.getJSON("product")
      editProductOptions(nextProductId);
    });
      
  }

  const firebaseUpdateProduct = (productData) => {

    Cookies.set("product", productData, { expires: 1 });

    db.collection("products")
      .doc(produto)
      .update(productData)
      .then(() => showAlert("Produto salvo com sucesso"))
      .catch((err) => {
        console.log(err);
        showAlert(err.message, true);
      })
      .finally(() => {
        
      });
      renderProductValue();
  }

  const renderProductValue = () => {

    const productData = Cookies.getJSON("product")
    setFormValues(form, productData);  

    renderProductOptions(productData.aditionals);

    [...document.querySelectorAll(".btn-edit")].forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = productData.aditionals.findIndex((product) => product.id === btn.dataset.id)
        editProductOptions(productData.aditionals[id]);
      })
    });

    [...document.querySelectorAll(".btn-remove")].forEach(btn => {
      btn.addEventListener("click", (e) => {
        
        
        const newAditionals = productData.aditionals.filter((product) => product.id !== btn.dataset.id);
        productData.aditionals = newAditionals
        console.log("foi", productData, newAditionals);

        firebaseUpdateProduct(productData)
        renderProductValue();
      })
    });

  }

  

  const productDate = [];
  const { produto } = getQueryString();
  auth.onAuthStateChanged((user) => {
    console.log(user);
    if (user) {
      userGlobal = user;

      db.collection("products")
        .doc(produto)
        .onSnapshot((snapshot) => {
          productDate.length = 0;

          productDate.push(snapshot.data());

          // snapshot.forEach((item) => {
          //   console.log(item.id);
          //   productDate.push(item.data()); 
          // });
          imageElement.src = productDate[0].photo || "./assets/images/user.svg";
          Cookies.set("product", ...productDate, { expires: 1 });
        });
      
      renderProductValue();
        
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

    productData.photo = imageElement.src;
    productData.companyId = userGlobal.uid;
    productData.price = productData.price.replace(",", ".");

    db.collection("products")
      .doc(produto)
      .update(productData)
      .then(() => showAlert("Produto salvo com sucesso"))
      .catch((err) => {
        console.log(err);
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
      imageElement.src = cropper.getCroppedCanvas().toDataURL("image/png");

      cropper.getCroppedCanvas().toBlob((blob) => {
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
