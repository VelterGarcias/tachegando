import firebase from "./firebase-app";
import { getFormValues, getQueryString, showAlert } from "./utils";
import axios from "axios";

document.querySelectorAll(".auth").forEach((page) => {
  const auth = firebase.auth();

  //==================   Login  =====================
  const formAuthLogin = document.querySelector("#form-login");

  const sendMail = async (values) =>{
      
      // console.log(values)

      const mail = {
          company: "tahChegando",
          email: "weads.velter@gmail.com",
          contactEmail: values.email,
          message: "",
          name: values.name,
          phone: "",
          subject: "Novo cadastro no App ",
      }

      await axios({
          method: 'post',
          headers: {    
              // 'crossDomain': true,
              // 'Access-Control-Allow-Origin' : '*',
              // 'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',

              // 'Content-Type': 'application/json',
              'Content-Type': 'text/plain;charset=utf-8',
          },
          url: 'https://script.google.com/macros/s/AKfycbwW0szWxfvsz3Sg9mrsMn2aHoroMxTsX0xFgcJwlFgDspLfEj4/exec',
          data: mail,
      })
      .then(
          (res)=> {
              // const tokenData = res.data.token
              // cookies.set('token', tokenData)
              // console.log('Usuário autenticado!')
              // alert(JSON.stringify(res.data))
              // window.location.href=("/contact")
          }
      )
      .catch(err => console.log('Deu ruim', err.message))
  }

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
    formAuthRegister.addEventListener("submit", async (e) => {
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
          // console.log(values);
          user
            .updateProfile({
              displayName: values.name,
            })
            .then(async (res) => {
              showAlert(
                `Bem-vindo ${values.name}, Usuário Cadastrado com Sucesso!`
              );
              axios({
                method: 'post',
                url: `https://api.telegram.org/bot5036731801:AAF0kNL7h9uzyoNeVYGGQQ_qyEoXr27AdFA/sendMessage?chat_id=-1001524221132&text=Ola%20${encodeURI(values.name)},%20seja%20bem-vindo%20ao%20App%20TahChegando!%20%20E-mail:%20${encodeURI(values.email)}`,
            })
              await sendMail(values);
              window.location.href = "/products.html";
                
            });
          // setTimeout(() => {
            
          // }, 2000);
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
