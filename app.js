const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('./util/logger');
const helmet = require('helmet');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path')
const db = require('./db');

const app = express();
const errorController = require('./controllers/error');

// config health LIVENESS
global.isOnline = true;

const port = 5000;
const vAPI = 'v1';
const apiURL = '/api/' + vAPI;


const Route = require('./route');

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
var accessLogStream = fs.createWriteStream(path.join(__dirname, '/logs/access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }));


app.get('/', (req, res) => {
	res.status(200).send("Acceso denegado");  
	logger.info("Acceso a index -- Acceso denegado")
});

app.get('/health/readiness', (req, res) => {
	logger.info("Acceso a health -- readiness " + global.isOnline)
	return global.isOnline ? res.status(200).send('ready') : res.sendStatus(500); 
});

app.get('/health/liveness', (req, res) => {
	logger.info("Acceso a health -- liveness " + global.isOnline)
	return global.isOnline ? res.status(200).send('live') : res.sendStatus(500); 
});

app.get('/health/kill', (req, res) => {
	global.isOnline = false;
	res.status(500).send("Health check is false");
	logger.info("Acceso a health -- KILL API")
});


// app.get(apiURL +'/stop/api', (req, res) => {
// 	global.isOnline = false;
// 	res.status(500).send("Health check is " + global.isOnline);  
// 	logger.info("Acceso a health -- STOP API")
// });

app.use(apiURL+"/clients", Route);

app.use(errorController.get404);


app.listen(port, () => {
	logger.info("Running -- Clientes service")
})



