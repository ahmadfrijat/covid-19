// including - importing libraries
const express = require('express');
const superAgent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const methodOverride = require('method-override');

// setup and configuration
require('dotenv').config();
const app = express();
app.use(cors());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
const client = new pg.Client(process.env.DATABASE_URL);   // on your machine
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); // for heroku

const PORT = process.env.PORT;



//routs 

app.get('/', handelHomePage);
app.get('/getCountryResult', handelCountryResult)
app.get('/allCountries', handelallCountries)
app.post('/myRecords', handelmyRecords)
app.get('/myRecords', handelmyRecordsTow)
app.get('/recordDetails/:id', handelrecordDetails)
app.delete('/recordDetails/:id', handeldelete)




//handlers

function handelHomePage(req, res) {

    let url = 'https://api.covid19api.com/world/total';

    superAgent.get(url).then(data => {
        // console.log(data.body);
        res.render('index', { data: data.body });

    }).catch(error=>{
        res.send('errrrrrror ' , error)
    })

}

function handelCountryResult(req, res) {
    let url = `https://api.covid19api.com/country/${req.query.country}/status/confirmed?from=${req.query.from}T00:00:00Z&to=${req.query.to}T00:00:00Z`

    superAgent.get(url).then(data => {

        let newData = data.body.map(data => new Country(data));
        // console.log(newData);
        res.render('getCountryResult', { data: newData });

    }).catch(error=>{
        res.send('errrrrrror ' , error)
    })

}

function handelallCountries(req, res) {
    let url = `https://api.covid19api.com/summary`

    superAgent.get(url).then(data => {

        let newData = data.body.Countries.map(data => new AllCountries(data));
        // console.log(newData);
        res.render('allCountries', { data: newData });

    }).catch(error=>{
        res.send('errrrrrror ' , error)
    })
}
function handelmyRecords(req, res) {
    let body = req.body;
    let SQL = 'INSERT INTO corona(country,totalConfirmed,totalDeaths,totalRecovered,date)VALUES($1,$2,$3,$4,$5) RETURNING *;';
    let values = [body.country, body.totalConfirmed, body.totalDeaths, body.totalRecovered, body.date];

    client.query(SQL, values).then(data => {

        res.redirect('/myRecords')
    }).catch(error=>{
        res.send('errrrrrror ' , error)
    })
}
function handelmyRecordsTow(req, res) {
    let SQL = 'SELECT * FROM corona;';

    client.query(SQL).then(data => {

        res.render('myRecords', { data: data.rows })
    }).catch(error=>{
        res.send('errrrrrror ' , error)
    })
}


function handelrecordDetails(req, res) {
    let id = req.params.id;
    let SQL = 'SELECT * FROM corona WHERE id=$1;';
    let value = [id];
    client.query(SQL, value).then(data => {
        // console.log(data.rows[0]);
        res.render('recordDetails', { data: data.rows[0] })
    }).catch(error=>{
        res.send('errrrrrror ' , error)
    })
}

function handeldelete(req, res) {
    let id = req.params.id;
    let SQL = 'DELETE FROM corona WHERE id=$1;';
    let value = [id];
    client.query(SQL, value).then(data => {
        res.redirect('/myRecords')
    }).catch(error=>{
        res.send('errrrrrror ' , error)
    })
}
//constructors 

function Country(data) {
    this.country = data.Country;
    this.cases = data.Cases;
    this.date = data.Date;

}

function AllCountries(data) {
    this.country = data.Country;
    this.totalConfirmed = data.TotalConfirmed;
    this.totalDeaths = data.TotalDeaths;
    this.totalRecovered = data.TotalRecovered;
    this.date = data.Date ? data.Date : "NO AVAILABLE RECORDS";
}





client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('app is working on port ', PORT);
    });
}).catch(error => {
    console.log('an error occurred while connecting to database ', error);
});