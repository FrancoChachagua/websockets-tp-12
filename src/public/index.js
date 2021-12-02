const socket = io();
//Form uno (POST)
const $divPost = document.querySelector('#formPost')
const $formOne = document.querySelector('#addProducts')
const $handlebarsTable = document.getElementById('handlebarsTable')
const $chat = document.getElementById('chat');
const $formChatLive = document.getElementById('formChatLive');
const $btnFormChat = document.getElementById('btnFormChat');


function JSClock() {
    let time = new Date();
    // calendary
    let date = time.getDate();
    let month = time.getMonth();
    let year = time.getFullYear();
    const calendary = date + "/" + (month + 1)+ "/" + year 
    // hour
    let hour = time.getHours();
    let minute = time.getMinutes();
    let second = time.getSeconds();
    let temp = '' + ((hour > 12) ? hour - 12 : hour);
    if (hour == 0)
        temp = '12';
    temp += ((minute < 10) ? ':0' : ':') + minute;
    temp += ((second < 10) ? ':0' : ':') + second;
    temp += (hour >= 12) ? ' P.M.' : ' A.M.';
    return {hour: temp, calendary:calendary};
    }


// chat 

$btnFormChat.addEventListener('click', (e)=>{
    e.preventDefault();
    let formData = new FormData($formChatLive);
    let message = formData.get('message');
    let email = formData.get('email');
    let time = JSClock();
    console.log(time);
    if(email && message){
        socket.emit('message', {email:email, time:`[${time.calendary} ${time.hour}]`, message:message});
    }
})


socket.on('chatHistory',data=>{
    let messagess = data.map((msjs)=>{
        return `<div>
                    <span> <b class="text-primary">${msjs.email}</b> <span class="text-secondary"> ${msjs.time}</span> : <span class="text-success fst-italic">${msjs.message}</span> </span>
                </div>`
    } ).join('');
    $chat.innerHTML= messagess
})


// dinamic table

socket.on('realTimeTable', data=>{
    let info = data.products;
    (info == `Data esta vacio! Primero debes ingresar un pedido!`) ? 
                                                                    prod = false
                                                                    : 
                                                                    prod = data.products;
    fetch('templates/productsTable.handlebars')
        .then(str=>str.text())
        .then(template=>{
            const templateTable = Handlebars.compile(template);
            const templateObj = {
                products:prod
            }
            const bodyHbs = templateTable(templateObj);
            $handlebarsTable.innerHTML= bodyHbs;
        })
})


$divPost.addEventListener('submit',(e)=>{
    e.preventDefault();
    let formData = new FormData($formOne);
    fetch('http://localhost:8080/productos',{
        method:'POST',
        body:formData,
    })
    .then(alert(`Usted ha añadido un nuevo producto!`))
    .then(result =>{
        return result.json();
    }).then(json=>{
        console.log(json);
    })
})
