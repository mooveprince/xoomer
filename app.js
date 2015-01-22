var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var CronJob = require('cron').CronJob;

var routes = require('./routes/index');
var timer = require('./utility/timer');
var scraper = require ('./utility/xoomscraper');

var app = express();
//Port and View-engine setup
app.set('port', process.env.PORT || 3000);

var server = require('http').createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

var url = process.env.SERVICE_URL || "http://localhost:3003/services";

var job = new CronJob({
  cronTime: '0 0 * * * 1-5',   
  onTick: function() {
      console.log ("Runs every hour on weekday..!!!" + new Date());
      timer.timeCheck (function (canBeRun) {
          if (canBeRun) {
              console.log ("Run the process");
              scraper.rateCheckAndSendEmail (url, function (isMailSent) {
                  if (isMailSent) {
                      console.log ("Scrap process was done and mail was sent");
                  } else {
                      console.log ("No mails was sent");
                  }
              });
          } else {
              console.log ("Dnt run the prcess");
          }
      } );      
  },
  start: false,
});

job.start();


module.exports = app;
