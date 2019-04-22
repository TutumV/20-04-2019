const express = require('express');
const fetch = require('isomorphic-fetch');
const app = express();
const MongoClient = require("mongodb").MongoClient;

const url = "mongodb://localhost:27017/";
const dbName = 'userdb';

const mongoClient = new MongoClient(url, { useNewUrlParser: true, auth: {
    user: 'root',
    password: 'example',
    }});

mongoClient.connect(function (err) {
    if (err) {
        console.log(err);
    }
    console.log("Connected");
    const db = mongoClient.db(dbName);
});

const listCurrency = ['AUD', 'AZN', 'GBP', 'AMD', 'BYN', 'BGN', 'BRL', 'HUF', 'HKD', 'DKK', 'USD', 'EUR', 'INR', 'KZT',
    'CAD', 'KGS', 'CNY', 'MDL', 'NOK', 'PLN', 'RON', 'XDR', 'SGD', 'TJS', 'TRY', 'TMT', 'UZS',
    'UAH', 'CZK', 'SEK', 'CHF', 'ZAR', 'KRW', 'JPY'];

app.get('/', function (req, res) {
    fetch('https://www.cbr-xml-daily.ru/daily_json.js')
        .then(response => {
            if (response.ok) {
                response.json()
                    .then(data => {
                        let currency = data.Valute;
                        let cleanedData = listCurrency.map(cur => {
                            return {
                                name: currency[cur].Name,
                                value: currency[cur].Value,
                                nominal: currency[cur].Nominal,
                                charcode: currency[cur].CharCode,
                            }
                        });
                        let bodyContent = '<html>' +
                            '<body>' +
                            '<table>' +
                            cleanedData.reduce((pv, cv) => {
                               return pv + '' +
                                   '<tr>' +
                                   '<td>' +
                                   cv.name +
                                   '</td>' +
                                   '<td>' +
                                   cv.value +
                                   '</td>' +
                                   '</tr>'
                            },'') +
                            '</table>' +
                            '</body>' +
                            '</html>';
                        res.status(200).send(bodyContent);

                    })
            }
        })
        .catch(error => {
            res.json({
                status: 'error',
                description: "Can't connect to https://www.cbr-xml-daily.ru/daily_json.js"
            });
        });
});


app.listen(5000, function () {
    console.log('Example app listening on port 5000!');
});
