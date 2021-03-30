import Cropper from "cropperjs";
import IMask from "imask";

import firebase from "./firebase-app";
import { showAlert, getFormValues } from "./utils";

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

  const inputName = form.querySelector('[name="name"]');
  const inputEmail = form.querySelector('[name="email"]');
  const inputPhone = form.querySelector('[name="phone"]');
  const inputAdress = form.querySelector('[name="adress"]');
  const inputNumber = form.querySelector('[name="number"]');
  const inputDistrict = form.querySelector('[name="district"]');
  const inputCity = form.querySelector('[name="city"]');

  new IMask(inputPhone, {
    mask: "(00) [0]0000-0000)",
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

  auth.onAuthStateChanged((user) => {
    if (user) {
      userGlobal = user;
      db.collection("users")
        .where("userId", "==", userGlobal.uid)
        .onSnapshot((snapshot) => {
          const userDate = [];

          snapshot.forEach((item) => {
            userDate.push(item.data());

            inputAdress.value = userDate[0].adress;
            inputCity.value = userDate[0].city;
            inputPhone.value = userDate[0].phone;
            inputNumber.value = userDate[0].number;
            inputDistrict.value = userDate[0].district;
          });

          console.log("userDate", userDate);
        });

      inputName.value = user.displayName;
      inputEmail.value = user.email;
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

    db.collection("users")
      .doc(userGlobal.uid)
      .set({
        name: inputName.value,
        email: inputEmail.value,
        phone: inputPhone.value,
        adress: inputAdress.value,
        number: inputNumber.value,
        district: inputDistrict.value,
        city: inputCity.value,
        userId: userGlobal.uid,
        photo: userGlobal.photoURL,
      })
      .then(() => userGlobal.updateProfile({ displayName: inputName.value}))
      .then(() => userGlobal.updateEmail(inputEmail.value))
      .then(() => showAlert("Usuário atualizado com sucesso"))
      .catch((err) => {
        console.log(err);
        showAlert(err.message, true)
      })
      .finally(() => {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = "Salvar";
      })

    //  const res = dbUser.update(dbUser);
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
