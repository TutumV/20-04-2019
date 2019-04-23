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
    const collection = db.collection('documents');


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
                                        date: new Date(),
                                    }
                                });
                                let time = +new Date();
                                let one = cleanedData.forEach(function (elem) {
                                    try {
                                        collection.insertOne({
                                            name: elem.name,
                                            value: elem.value,
                                            charcode: elem.charcode,
                                            nominal: elem.nominal,
                                            date: time,
                                        }), function (err, result) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log(result);
                                            }
                                        }
                                    } catch (e) {
                                        console.log(e);
                                    }
                                    try{
                                    MongoClient.close();
                                    } catch (e) {
                                    }
                                    });
                                let bodyContent = '<html>' +
                                    '<body>' +
                                    '<table border="5px" width="5px" height="100px">' +
                                    cleanedData.reduce((pv, cv) => {
                                        return pv + '' +
                                            '<tr>' +
                                            '<td>' +
                                            cv.name +
                                            '</td>' +
                                            '<td>' +
                                            cv.value +
                                            '</td>' +
                                            '<td>' +
                                            cv.date +
                                            '</td>' +
                                            '<td>' +
                                            cv.charcode +
                                            '</td>' +
                                            '</tr>'
                                    }, '') +
                                    '</table>' +
                                    '</body>' +
                                    '</html>';
                                res.status(200).send(bodyContent);
                            }
                        )
                }
            })
            .catch(error => {
                res.json({
                    status: 'error',
                    description: "Can't connect to https://www.cbr-xml-daily.ru/daily_json.js"
                });
            });
    });
    app.get('/currency/:charcode', function (req, res) {
        let charcode = req.params["charcode"];
        const find = collection.find({'charcode': charcode}).sort({date: -1}).limit(-1).toArray(function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                let response = '<html>' +
                    '<body>' +
                    '<table border="5px" width="5px" height="100px">' +
                    '<tr>' +
                    "Название" +
                    '<td>' +
                    docs[0].name +
                    '</td>' +
                    'Значение' +
                    '<td>' +
                    docs[0].value +
                    '</td>' +
                    'Код' +
                    '<td>' +
                    docs[0].charcode +
                    '</td>' +
                    '</tr>' +
                    '</table>' +
                    '</body>' +
                    '</html>';
                res.status(200).send(response);
            }
        });
    })
});

app.listen(5000, function () {
    console.log('Example app listening on port 5000!');
});
