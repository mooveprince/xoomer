var express = require('express');
var CronJob = require('cron').CronJob;
var nodemailer = require('nodemailer');
var smtpPool = require('nodemailer-smtp-pool');
var cheerio = require('cheerio'); 
var request = require('request');
var mustache = require ('mustache');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var app = express();
var scrape = require('./utility/xoomscraper');
var sm = require('./utility/mailsender');

var routes = require('./routes/index');

//Port and View-engine setup
app.set('port', process.env.PORT || 3000);

var server = require('http').createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);


var template = process.cwd() + '/rateChangeMail.html';

//DB Connection
var pg = require('pg');
var conString = process.env.DATABASE_URL || "postgres://local_admin:1661@localhost:5432/local_admin";
var client = new pg.Client(conString);
client.connect();

var job = new CronJob({
  cronTime: '0 * * * * *',
  onTick: function() {
    console.log ("Runs every Minute..!!!");
    scrape.checkXoomValue (request, cheerio, client, function ( ) {
        sm.sendMail (nodemailer, smtpPool, client, fs, template, mustache);
    });  
  },
  start: false,
});

//Uncomment below line for cron execution
job.start();

module.exports = app;
