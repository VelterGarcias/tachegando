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
  const btnEditOption = document.querySelector(".btn-edit");

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

  const editProductOptions = (productOptionId) => {

    let contentModal = "";

    contentModal =
      contentModal +
      `<form>
        <ul class="options">
          <input type="hidden"  name="id" value="${productOptionId}" />
          <label for="option-title">Título do Adicional</label>
          <div class="row">  
            <input type="text"  name="option-title" placeholder="Nome do Adicional" value="Escolha o sabor da cobertura" />
          </div>
          <div class="row">  
            <div>
              <label for="min">Mínimo</label>
              <input type="number"  name="min" />
            </div>
            <div>
              <label for="max">Máximo</label>
              <input type="number"  name="max" />
            </div>
          </div>
          
          <li class="row">
            <input type="text" name="option" />
            <button type="button" class="btn-remove">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="black" />
            </svg>
            </button>
            <input type="text" name="price" placeholder="R$"/>
        
          </li>
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
      console.log("data", data)
      let oldProductData = Cookies.getJSON("product")
      
      if (oldProductData.nextProductId) {
        const idExists = oldProductData.aditionals.findIndex((product) => product.id === data.id)
        console.log("idExists", idExists)
        if (idExists >= 0) {
          console.log("aqui");
          oldProductData.aditionals[idExists] = data
        } else {
          console.log("push");
          oldProductData.aditionals.push(data)
        }
        oldProductData.nextProductId = ++oldProductData.nextProductId
        
      } else {
        oldProductData.nextProductId = 2
        oldProductData.aditionals = [data]
      }
      
      const teste = oldProductData.aditionals.findIndex((product) => product.id === data.id)
      console.log("teste", teste)

      Cookies.set("product", oldProductData, { expires: 1 });
      // renderProductValue(); 


      db.collection("products")
      .doc(produto)
      .update(oldProductData)
      .then(() => showAlert("Produto salvo com sucesso"))
      .catch((err) => {
        console.log(err);
        showAlert(err.message, true);
      })
      .finally(() => {
        const modal = document.querySelector("#modal");
        modal.classList.remove("open");
        modal.innerHTML = "";
      });

      
    })

    updateBtnRemove();
    
  };

  const renderProductValue = () => {
    setFormValues(form, Cookies.getJSON("product"));  
    console.log(Cookies.getJSON("product"));
  }

  btnEditOption.addEventListener("click", (e) => {
    editProductOptions(1);
  });

  const productDate = [];
  const { produto } = getQueryString();
  auth.onAuthStateChanged((user) => {
    console.log(user);
    if (user) {
      userGlobal = user;

      console.log("produto", produto);

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
      console.log("productDate1", productDate);
      
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

    console.log(productData);
    console.log(productDate[0].name);

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
    console.log(cropper);
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
            console.log("photo", photo);
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
