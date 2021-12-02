import express from 'express';
import cors from 'cors';
import {engine} from 'express-handlebars';
import upload from './services/upload.js';
import Contenedor from './classes/Contenedor.js';
import { __dirname } from './utils.js';
import { Server } from 'socket.io';

// import path from 'path';
// const __dirname = path.resolve();

const app = express();
const PORT = 8080;
const server = app.listen(PORT, () =>{
    console.log(`Servidor escuchando en mi proyecto, products: ${PORT}`);
})
server.on('error', (error)=>console.log(`Error en el servidor ${error}`))

const contenedor = new Contenedor();
const io = new Server(server);
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors());
app.use(express.static(__dirname+'/public'));
app.use((req,res,next)=>{
    let timestamp = Date.now();
    let time = new Date(timestamp);
    console.log(`Peticion hecha a las ${time.toTimeString().split(" ")[0]}`);
    next();
})
//definir motor de plantilla
app.engine('handlebars', engine());
app.set('views', __dirname+'/views');
app.set('view engine','handlebars')

// GET
app.get('/productos', (req,res)=>{
    contenedor.getAll().then(result=>{
        let info = result.products;
        if(info === `Data esta vacio! Primero debes ingresar un pedido!`|| undefined){
            res.render('products',{
                noObject: true
            });
        }else{
            let preparedObject = {
                            products : info
                        }
            res.render('products', preparedObject);
        }
    })
})

// POST 
app.post('/api/uploadfile',upload.array('images'),(req,res)=>{
    const files = req.files;
    if(!files || files.length===0){
        res.status(500).send({message:"No se subio el archivo"})
    }
    res.send(files);
})

app.post('/productos', upload.single('image'),(req,res)=>{
    let product = req.body;
    product.price = parseInt(product.price);
    let thumbnail = 'http://localhost:8080/'+req.file.filename;
    product.thumbnail = thumbnail;
    contenedor.save(product).then(result=>{
        res.send(result);
        if(result.message==="Pedido creado con exito"){
            contenedor.getAll().then(result=>{
                console.log(result.products);
                io.emit('realTimeTable', result)
            })
        }
    })
})

// io socket
io.on('connection', async socket=>{
    let products = await contenedor.getAll();
    socket.emit('realTimeTable', products)
})

let messages = [];

io.on('connection', socket=>{
    socket.emit('chatHistory', messages)
    socket.on('message', data=>{
        messages.push(data)
        io.emit('chatHistory', messages);
    })
});