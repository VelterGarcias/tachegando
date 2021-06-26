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
  let atualCompanyHash = null;
  let isUniqueHash = true;
  const imageElement = document.querySelector("#photo-preview");
  const buttonElement = document.querySelector(".choose-photo");
  const linkShop = document.querySelector("#link-shop");
  const inputFileElement = document.querySelector("#file");
  const btnSubmit = form.querySelector("[type=submit]");
  const inputPix = form.querySelector("#pix");

  const inputPhone = form.querySelector('[name="phone"]');
  const inputCep = form.querySelector('[name="cep"]');
  const inputDelivery = form.querySelector('#delivery');
  const inputHash = form.querySelector('#hash');
  const hashSuccess = form.querySelector('#hash-success');
  const hashError = form.querySelector('#hash-error');

  new IMask(inputPhone, {
    mask: "(00) [0]0000-0000)",
  });

  new IMask(inputCep, {
    mask: "00000-000",
  });

  new IMask(inputDelivery, {
    mask: Number,  // enable number mask

    // other options are optional with defaults below
    scale: 2,  // digits after point, 0 for integers
    signed: false,  // disallow negative
    thousandsSeparator: '',  // any single char
    padFractionalZeros: false,  // if true, then pads zeros at end to the length of scale
    normalizeZeros: false,  // appends or removes zeros at ends
    radix: '.',  // fractional delimiter
    mapToRadix: [',']  // symbols to process as radix
  });

  const bodyElement = document.body;

  const hidePixOptions = () => {
    // console.log("exec")
    if(inputPix.checked) {
      document.querySelector('.wrap-pix').style.display = 'block';
    } else {
      document.querySelector('.wrap-pix').style.display = 'none';
    }
  }

  inputPix.addEventListener('change', (e) => {
    hidePixOptions();
  })


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

  const verifyUniqueHash = async (db, onMessage = true) => {
    inputHash.classList.remove('danger')
    inputHash.classList.remove('success')
    hashSuccess.classList.add('hide')
    hashError.classList.add('hide')
    const search = inputHash.value
    const res = await db
        .collection("companies")
        .where("hash", "==", search)
        .get();
    
    let hashExist = null
    res.forEach((item) => {
      hashExist = item.data();
    });
    if(!hashExist || atualCompanyHash == search) {
      // console.log("hashExist", hashExist);
      // console.log("Novo");
      isUniqueHash = true;
      inputHash.classList.add('success')
      hashSuccess.classList.remove('hide')
      onMessage && showAlert('OK! O Link que você escolheu está disponível')
      return true;
    } else {
      // console.log("Novo");
      isUniqueHash = false;
      inputHash.classList.add('danger')
      hashError.classList.remove('hide')
      showAlert('ERRO: O Link que você escolheu não está disponível', true)
      return false;
    }
  }

  

  const userDate = [];
  auth.onAuthStateChanged((user) => {
    // console.log(user);
    
    if (user) {
      userGlobal = user;
      db.collection("companies")
        .where("userId", "==", userGlobal.uid)
        .onSnapshot((snapshot) => {
          userDate.length = 0;

          snapshot.forEach((item) => {
            userDate.push(item.data());
          });
          // console.log("userDate", userDate);
          if (userDate.length == 0 ) {
            userDate.push({
              name: user.displayName,
              email: user.email,
            });
          }
          setFormValues(form, ...userDate);
          if (userDate[0].hash) {
            const hash = `${window.location.origin}#${userDate[0].hash}`
            atualCompanyHash = userDate[0].hash;
            linkShop.innerHTML = hash
            linkShop.href = hash
          } else {
            linkShop.innerHTML = "Você ainda não escolheu um Link Único para sua empresa."
            // linkShop.href = '#hash'
          }
          
          document.querySelectorAll(".main-color").forEach((btn) => {
            btn.style = `background-color: ${userDate[0].main_color}`;
          });
          document.querySelectorAll(".second").forEach((btn) => {
            btn.style = `background-color: ${userDate[0].second_color}`;
          });
          
          hidePixOptions();
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
    
    if(!isUniqueHash) {
      console.log("ruim");
      inputHash.focus();
      showAlert('ERRO: Escolha um link válido antes de salvar!', true)
    } else {
        console.log("bom");
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = "Salvando...";

        const companyData = getFormValues(form)

        companyData.photo = userGlobal.photoURL
        companyData.userId = userGlobal.uid

        // console.log(companyData);
        // console.log(userDate[0].name)

        db.collection("companies")
          .doc(userGlobal.uid)
          .set(companyData)
          .then(() => userGlobal.updateProfile({ displayName: userDate[0].name}))
          .then(() => userGlobal.updateEmail(userDate[0].email))
          .then(() => showAlert("Usuário atualizado com sucesso"))
          .catch((err) => {
            // console.log(err);
            showAlert(err.message, true)
          })
          .finally(() => {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "Salvar";
          })
    }
  });

  imageElement.addEventListener("click", (e) => {
    buttonElement.click();
  });

  buttonElement.addEventListener("click", (e) => {
    // console.log(cropper);
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
            btnSubmit.click();
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

  inputHash.addEventListener('input', (e)=>{
    verifyUniqueHash(db, false);
  })
  inputHash.addEventListener('change', (e)=>{
    verifyUniqueHash(db);
  })

});
