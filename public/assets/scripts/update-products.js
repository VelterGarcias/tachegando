import Cropper from "cropperjs";
import IMask from "imask";

import firebase from "./firebase-app";
import { showAlert, getFormValues, setFormValues, getQueryString } from "./utils";

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

  const userDate = [];
  const { produto } = getQueryString()
  auth.onAuthStateChanged((user) => {
    console.log(user);
    if (user) {
      userGlobal = user;

      console.log("produto", produto);

      db.collection("products")
        .doc(produto)
        .onSnapshot((snapshot) => {
          userDate.length = 0;

          userDate.push(snapshot.data());

          // snapshot.forEach((item) => {
          //   console.log(item.id);
          //   userDate.push(item.data());
          // });
          
          setFormValues(form, ...userDate);
          imageElement.src = userDate[0].photo || "./assets/images/user.svg";
        });
        console.log("userDate1", userDate);
      
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

    if (cropper) {
    } 
    const productData = getFormValues(form)

    productData.photo = userGlobal.photoURL
    productData.companyId = userGlobal.uid

    console.log(productData);
    console.log(userDate[0].name)

    db.collection("products")
      .doc(produto)
      .set(productData)
      .then(() => showAlert("Produto salvo com sucesso"))
      .catch((err) => {
        console.log(err);
        showAlert(err.message, true)
      })
      .finally(() => {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = "Salvar";
      })

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

        const fileRef = storage.ref().child(`photos/${userGlobal.uid}/${produto}.png`);

        fileRef
          .put(blob)
          .then((snapshot) => snapshot.ref.getDownloadURL())
          // .then((photoURL) => userGlobal.updateProfile({ photoURL }))
          .then((photo) => {
            console.log("photo", photo);
            db.collection("products").doc(produto).update({photo: photo});

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
