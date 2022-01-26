import firebase from "./firebase-app";
import IMask from "imask";
import Cookies from "js-cookie";
import { appendTemplate, formatCurrency, getFormValues, renderOrderList, saveOrder, setFormValues, showAlert } from "./utils";
import axios from "axios";





const payment = document.querySelector("#payment");




if (payment) {

  const wrapPayMethod = document.querySelector('#pay-method')

  const refreshTaxToOrder = (tax) => {
    let oldOrder = Cookies.getJSON("order");
    if(tax) {
    
      let data = {}

      
      if (oldOrder) {
        oldOrder = oldOrder.filter((x) => x.name != 'Taxa de Entrega');
        data = {
          name: "Taxa de Entrega",
          price: tax,
          total: tax,
        }
        // data.find( product => product.id === idBtn );
        data.id = Number(Cookies.get("nextOrderId"))
        oldOrder.push(data);
        Cookies.set("nextOrderId", ++data.id, { expires: 15 });
        Cookies.set("order", oldOrder, { expires: 1 });
      } else {
        // console.log("Não encontrei nenhuma ordem")
      }
      renderOrderList();
      // console.log("order", Cookies.getJSON("order"));
    } else {
      oldOrder = oldOrder.filter((x) => x.name != 'Taxa de Entrega');

      // console.log(oldOrder);

      Cookies.set("order", oldOrder, { expires: 15 });
      renderOrderList();
    }
  
  };
  
  const submitForm = (form) => {

    wrapPayMethod.classList.remove('danger');

    if (minRadioButtonChecked) {
  
      const dataForm = getFormValues(form);
      // console.log(dataForm);
      delete dataForm.delivery;
      Cookies.set('user', dataForm)
      const { phone, name } = Cookies.getJSON("company")
  
      let whats = phone.replace('(', '')
      whats = phone.replace(')', '')
      whats = phone.replace(' ', '')
      whats = phone.replace('-', '')
  
      const order = Cookies.getJSON("order")
  
      const msgHeader = 
  `
  🆃🅰🅲🅷🅴🅶🅰🅽🅳🅾\n
  *${name}*
  ............................................................
  𝓟𝓮𝓭𝓲𝓭𝓸 𝓯𝓮𝓲𝓽𝓸 𝓹𝓸𝓻:
  *${dataForm.name}*
  ............................................................
  `
      let messageBody = ''
  
      // console.log("order", order)
      
      let total = 0;
      order.forEach((item,i) => {
      let msgItem = 
  `
  
  ❍ *${item.name}*: ${formatCurrency(item.total)}
  `
      if(item.details) {
        if(!item.details.empty) {
          item.details.forEach(detail => {
            let items = ''
            detail.items.forEach(detailItem => {
              const [name] = detailItem.split('=')
              items = items + `      - ${name}\n`
            })
            msgItem = msgItem + `    ${detail.title}:\n${items}`
          });
        }
      }
  
        // if(!item.details.empty) {
        //   item.details.forEach((detail) => {
        //     msgItem = msgItem + `${detail.name} - ${detail.price} %0A`
        //   })
        // }
        // console.log('item', item.comments)
        let comments = '';
        if (item.comments) {
          comments = `    _Observações: ${item.comments}_\n`
        } 
  
  
        messageBody = messageBody + msgItem + comments
        total += Number(item.total)
      });
  
      const msgFooter = 
  `
  ............................................................
  𝙏𝙤𝙩𝙖𝙡 𝙙𝙤 𝙥𝙚𝙙𝙞𝙙𝙤: *${formatCurrency(total)}*
  `
      
      let msgPayment = ''

      if(dataForm.payments == "cartao") {
        msgPayment = 
  `............................................................\n
  *Método de Pagamento:*
  💳 Máquininha de Cartão: *${dataForm.selectedCard}*
  `
      } else if (dataForm.payments == "pix") {
        msgPayment = 
  `............................................................\n
  *Método de Pagamento:*
  💠 PIX
  `
      } else if (dataForm.payments == "dinheiro") {

        // console.log(dataForm["money-change"]);
        
        msgPayment = 
  `............................................................\n
  *Método de Pagamento:*
  💵 Dinheiro (${dataForm["money-change"] ? `Troco para: ${formatCurrency(dataForm["money-change"])}` : 'Não precisa trazer troco'})
  `
      }


      let msgAdress = 
  `\n
  *O cliente irá buscar o pedido na loja.*\n
  `

      if(dataForm.adress) {
        msgAdress = 
  `\n
  *Endereço de Entrega:* 
  ${dataForm.adress}, ${dataForm.number} 
  ${dataForm.complement && dataForm.complement + ''}
  ${dataForm.district} - ${dataForm.city}
  ${dataForm.cep ? 'CEP: ' + dataForm.cep : ''} 
  ${dataForm.reference ? 'Ponto de referência: ' + dataForm.reference : ''} 
  `
      } else {

      }
  
      const msg = msgHeader + messageBody + msgFooter + msgPayment + msgAdress
  
      console.log(msg);
      console.log(encodeURIComponent(msg));
  
      window.location.href = `https://api.whatsapp.com/send/?phone=55${whats}&text=${encodeURIComponent(msg)}`;
  
    } else {
      wrapPayMethod.classList.add('danger')
      showAlert('ERRO: Antes de enviar seu pedido escolha um método de pagamento!', true)
    }
  };


  const cepIsReady = false;
  let minRadioButtonChecked = true;
  const btnPay = document.querySelector("#btn-pay-order");
  const form = payment.querySelector("form");
  const isDelivery = form.querySelector('#delivery')
  const taxDelivery = form.querySelector('#tax-delivery')
  const inputMoneyChange = form.querySelector('#money-change')
  const pixCompany = form.querySelector('#pix-company')

  const user = Cookies.getJSON("user");
  const company = Cookies.getJSON("company");
  console.log(user, company);
  if (user) {
    setFormValues(form, user)

    // if () {

    // }
  }

  new IMask(inputMoneyChange, {
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

  const renderRadioButtons = () => {
    [...document.querySelectorAll('[name="payments"]')].forEach(radio => {
        if(radio.checked) {
          // console.log(`msg-${radio.id}`);
          document.querySelector(`#msg-${radio.id}`).classList.remove('hide');
        } else {
          document.querySelector(`#msg-${radio.id}`).classList.add('hide');
        }
    })
  }

  [...document.querySelectorAll('[name="payments"]')].forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (radio.id == 'card') {
        minRadioButtonChecked = false;
      } else {
        minRadioButtonChecked = true;
      }
      
      wrapPayMethod.classList.remove('danger')
      renderRadioButtons();
    })
  });
  

  const renderAdress = () => {
    const wrapAdress = form.querySelector('#adress')
    const msgDelivery = form.querySelector('.msg-delivery')

    if (isDelivery.checked) {
        wrapAdress.innerHTML = ""
        msgDelivery.innerHTML = "Desative essa opção se desejar buscar o seu pedido na loja."
        if (!isNaN(company.delivery)) {
          taxDelivery.querySelector('strong').innerHTML = `${formatCurrency(company.delivery)}`
          taxDelivery.classList.remove('hide');
          refreshTaxToOrder(company.delivery);
        }
        

        

        appendTemplate(wrapAdress, 'div', `
        <h3>Endereço</h3>
        <input type="text" name="cep" placeholder="CEP (não obrigatório)" />
        <input type="text" name="adress" placeholder="Endereço" required/>
        <input type="number" name="number" placeholder="Nº da Casa" required/>
        <input type="text" name="complement" placeholder="Complemento (não obrigatório)" />
        <input type="text" name="reference" placeholder="Ponto de Referência (não obrigatório)" />
        <input type="text" name="district" placeholder="Bairro" required/>
        <input type="text" name="city" placeholder="Cidade" required/>
        <input type="text" name="UF" placeholder="Estado" required/>
        `)
        if (user) setFormValues(form, user);
        minRadioButtonChecked = false;
        [...document.querySelectorAll('[name="payments"]')].forEach(radio => {
          radio.checked = false;
        });

        [...document.querySelectorAll('[name="selectedCard"]')].forEach(radioCard => {
          radioCard.checked = false;
        });

        [...document.querySelectorAll('[id^="msg-"]')].forEach(wrapMessage => {
          wrapMessage.classList.add('hide');
        });
  
        if (!cepIsReady) {
  
          const inputCep = form.querySelector('[name="cep"]');
  
          new IMask(inputCep, {
            mask: "00000-000",
          });
  
          inputCep.addEventListener('change', (e) => {
            const cep = inputCep.value.replace('-','');
            // console.log(cep,cep.length);
            if (cep.length == 8) {
              axios.get(`https://viacep.com.br/ws/${cep}/json/`)
              .then(function (response) {
                // handle success
                const {bairro, localidade, logradouro, uf} = response.data;
        
                const cepData = {
                  adress: logradouro,
                  city: localidade,
                  district: bairro,
                  UF: uf
                }
        
                setFormValues(form, cepData);
              })
              .catch(function (error) {
                // handle error
                // console.log(error);
              })
              .then(function () {
                // always executed
                // console.log("finiu");
              });
            }
          })
        }
  
    } else {
      wrapAdress.innerHTML = ""
      msgDelivery.innerHTML = "Ative essa opção se desejar receber o seu pedido em casa."
      taxDelivery.classList.add('hide');

      refreshTaxToOrder();
    }
  }

  isDelivery.addEventListener('change', (e) => {
    renderAdress();
  })
  
  if (company.payments) {
    minRadioButtonChecked = false;
    company.payments.forEach((payment) => {
      const wrap = document.querySelector(`[name="payments"][value="${payment}"`).closest('.row')
      if(wrap) {
        wrap.classList.remove('hide')
        if (payment == 'cartao') {
          console.log("quais cartões");
          const arrayCards = company.cards
          if (arrayCards) {
            arrayCards.forEach((card, indexCard) => {
              console.log(card);
              const wrapCards = document.querySelector('#cards')
              appendTemplate(wrapCards, 'li class=row', `
              <input type="radio" id="${card}" name="selectedCard" value="${card}"/>
              <label for="${card}" ><img alt="${card}" src="assets/images/cards/${card}.svg"></label>
              `)

              if ((indexCard + 1) == card.length) {
                [...document.querySelectorAll('[name="selectedCard"]')].forEach(radioCards => {
                  radioCards.addEventListener('change', (e) => {
                    minRadioButtonChecked = true;
                    wrapPayMethod.classList.remove('danger')
                  })
                })
              }
            });
          }
        }
        // if (!firtsValidRadioButtonChecked) document.querySelector(`[name="payments"][value="${payment}"`).checked = true;
        // firtsValidRadioButtonChecked = true;
      }
    })
  } else {
    document.getElementById('payment-title').style.display = 'none'
  }
  
  
  pixCompany.innerHTML = company.pix
  renderAdress();
  renderRadioButtons();
  renderOrderList();

  btnPay.addEventListener("click", (e) => {
    form.querySelector('button[type="submit"]').click();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitForm(form);
  });

}
