const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

//registers middleware to interpret json requests
app.use(bodyParser.json({limit: '100mb', extended: true}));
app.use(bodyParser.urlencoded({ extended: false }));

//define which folder will store and make public static files
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('https://liviapsique.com.br/home/index.html');
});

//returns all controllers to the application 
require('./app/controllers/indexController.js')(app);

app.listen(port, () => {
    console.log(`Server on`);
});