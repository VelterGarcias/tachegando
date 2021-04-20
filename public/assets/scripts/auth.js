import firebase from "./firebase-app";
import { getFormValues, getQueryString, showAlert } from "./utils";

document.querySelectorAll(".auth").forEach((page) => {
  const auth = firebase.auth();

  //==================   Login  =====================
  const formAuthLogin = document.querySelector("#form-login");

  if (formAuthLogin) {
    formAuthLogin.addEventListener("submit", (e) => {
      e.preventDefault();

      const btnSubmitForm = formAuthLogin.querySelector('footer button[type=submit]');
      const btnSubmitFormText =  btnSubmitForm.innerHTML;

      btnSubmitForm.innerHTML = "Autenticando...";
      btnSubmitForm.disabled = true;

      const values = getFormValues(formAuthLogin);

      auth
        .signInWithEmailAndPassword(values.email, values.password)
        .then((response) => {
          showAlert("Logado com Sucesso!");
          setTimeout(() => {
            window.location.href = "/products.html";
          }, 3000);
        })
        .catch((err) => {
          showAlert(err, true);
            btnSubmitForm.innerHTML = btnSubmitFormText;
            btnSubmitForm.disabled = false;
        });
    });
  }

  //==================   Cadastro  ======================
  const formAuthRegister = document.querySelector("#form-register");

  if (formAuthRegister) {
    formAuthRegister.addEventListener("submit", (e) => {
      e.preventDefault();

      const btnSubmitForm = formAuthRegister.querySelector('footer button[type=submit]');
      const values = getFormValues(formAuthRegister);
      const btnSubmitFormText =  btnSubmitForm.innerHTML;

      btnSubmitForm.innerHTML = "Criando conta...";
      btnSubmitForm.disabled = true;

      auth
        .createUserWithEmailAndPassword(values.email, values.password)
        .then((response) => {
          const { user } = response;
          console.log(values);
          user
            .updateProfile({
              displayName: values.name,
            })
            .then((res) => {
              showAlert(
                `Bem-vindo ${values.name}, Usuário Cadastrado com Sucesso!`
              );
            });
          setTimeout(() => {
            window.location.href = "/products.html";
          }, 2000);
        })
        .catch((error) => {
          showAlert(error.message, true)
            btnSubmitForm.innerHTML = btnSubmitFormText;
            btnSubmitForm.disabled = false;
        });
    });
  }

  //==================   Esqueci a senha  =====================
  const formForget = document.querySelector("#form-forget");

  if (formForget) {
    formForget.addEventListener("submit", (e) => {
      e.preventDefault();

      const values = getFormValues(formForget);
      const btnSubmitForm = formForget.querySelector("[type=submit]");
      const btnSubmitFormText =  btnSubmitForm.innerHTML;

      btnSubmitForm.disabled = true;
      btnSubmitForm.innerHTML = "Enviando...";

      auth
        .sendPasswordResetEmail(values.email)
        .then(() => {
          showAlert("Verifique o seu email");
          setTimeout(() => {
            window.location.href = "/login.html";
          }, 3000);
        })
        .catch((error) => {
          showAlert(error.message, true);
          btnSubmitForm.innerHTML = btnSubmitFormText;
          btnSubmitForm.disabled = false;
        });
    });
  }

  //==================   Redefinindo a senha  =====================
  const formReset = document.querySelector("#form-reset");

  if (formReset) {
    formReset.addEventListener("submit", (e) => {
      e.preventDefault();

      const btnSubmitForm = formReset.querySelector("[type=submit]");
      const btnSubmitFormText =  btnSubmitForm.innerHTML;

      btnSubmitForm.disabled = true;
      btnSubmitForm.innerHTML = "Redefinindo...";

      const { oobCode } = getQueryString();
      const { password } = getFormValues(formReset);

      auth
        .verifyPasswordResetCode(oobCode)
        .then(() => auth.confirmPasswordReset(oobCode, password))
        .then(() => {
          showAlert("Senha redefinida com sucesso!");
          setTimeout(() => {
            window.location.href = "/login.html";
          }, 3000);
        })
        .catch((error) => {
          showAlert(error.message, true);
          btnSubmitForm.innerHTML = btnSubmitFormText;
          btnSubmitForm.disabled = false;
        });
    });
  }

});
