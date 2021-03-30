import Cropper from "cropperjs";
import IMask from "imask";

import firebase from "./firebase-app";
import { showAlert, getFormValues, setFormValues } from "./utils";

//======================== Atualizar Dados ====================================
document.querySelectorAll("#form-update").forEach((form) => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  let cropper = null;
  let userGlobal = null;
  const imageElement = document.querySelector("#photo-preview");
  const buttonElement = document.querySelector(".choose-photo");
  const inputFileElement = document.querySelector("#file");
  const btnSubmit = form.querySelector("[type=submit]");

  const inputPhone = form.querySelector('[name="phone"]');
  const inputCep = form.querySelector('[name="cep"]');

  new IMask(inputPhone, {
    mask: "(00) [0]0000-0000)",
  });

  new IMask(inputCep, {
    mask: "00000-000",
  });

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
  auth.onAuthStateChanged((user) => {
    console.log(user);
    if (user) {
      userGlobal = user;
      db.collection("users")
        .where("userId", "==", userGlobal.uid)
        .onSnapshot((snapshot) => {
          userDate.length = 0;

          snapshot.forEach((item) => {
            userDate.push(item.data());
          });
          console.log("userDate", userDate);
          setFormValues(form, ...userDate);
        });
      imageElement.src = user.photoURL || "./assets/images/user.svg";
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
    const companyData = getFormValues(form)

    companyData.photo = userGlobal.photoURL
    companyData.userId = userGlobal.uid

    console.log(companyData);
    console.log(userDate[0].name)

    db.collection("users")
      .doc(userGlobal.uid)
      .set(companyData)
      .then(() => userGlobal.updateProfile({ displayName: userDate[0].name}))
      .then(() => userGlobal.updateEmail(userDate[0].email))
      .then(() => showAlert("Usuário atualizado com sucesso"))
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

        const fileRef = storage.ref().child(`photos/${userGlobal.uid}.png`);

        fileRef
          .put(blob)
          .then((snapshot) => snapshot.ref.getDownloadURL())
          .then((photoURL) => userGlobal.updateProfile({ photoURL }))
          .then(() => {
            imageElement.src = userGlobal.photoURL;
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
