var nodemailer = require('nodemailer');
var smtpPool = require('nodemailer-smtp-pool');
var mustache = require ('mustache');
var request = require('request');
var fs = require('fs');

var transporter = nodemailer.createTransport(smtpPool({
    service: 'Gmail',
    auth: {
        user: process.env.XOOMER_EMAIL_USERNAME,
        pass: process.env.XOOMER_EMAIL_PW 
    },
    maxConnections: 3,
    maxMessages: 10        
}));  

exports.sendSubscriptionMail = function (url, recipentEmail) {
    var subscribedTemplate = process.cwd() + '/utility/subscribed.html';
    var currentRateUrl = url + '/getCurrentXoomRate';
    
    request({url:currentRateUrl, json:true}, function (error, response, body ) {
        if (error) {
            console.log ("Error in getting the current rate" + error);
        } else {
            fs.readFile(subscribedTemplate, 'utf8', function (err, file) {
                if (err) {
                    console.log ("Error in reading template " + err);
                } else {
                    console.log ("Current rate is " + body.currentRate);
                    var htmlMsg = mustache.to_html(file, {currentValue: body.currentRate});
                    var textMsg = 'Welcome, Current Xoom Rate to India is ' + body.currentRate ;  
                    var mailOptions = {
                        from: 'Xoomer Admin <ratecheckxoomer@gmail.com>',
                        bcc: recipentEmail,
                        subject: 'Welcome aboard!',
                        text: textMsg,
                        html: htmlMsg
                    };
                   transporter.sendMail (mailOptions, function (err, result) {
                        if (err) {
                            console.log ("Msg sending failed");
                        } else {
                            console.log ("Msg sent successfully to " + recipentEmail);
                        }
                    });                    
                }
            });
        }
    });
}

exports.rateChangedMail = function (url, oldValue, newValue) {
    var rateChangedTemplate = process.cwd() + '/utility/rateChangeMail.html';
    var getSubscriberUrl = url + '/getActiveSubscribers';
    
     request ({url: getSubscriberUrl, json:true}, function (error, response, body) { 
         if (error) {
            console.log ("Error in getting subscriber list" + error);
        } else {
            getEmailReceipentList (body, function (emailsString) {
                fs.readFile(rateChangedTemplate, 'utf8', function (err, file) {
                    if (err) {
                        console.log ("Err in reading template" +err);
                    } else {
                        var htmlMsg = mustache.to_html(file, {oldValue: oldValue, newValue:newValue});
                        var textMsg = 'Value changed from ' + oldValue + ' to ' + newValue;
                        var mailOptions = {
                            from: 'Xoomer Admin <ratecheckxoomer@gmail.com>',
                            bcc: emailsString,
                            subject: 'Rate Changed',
                            text: textMsg,
                            html: htmlMsg
                        } 
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log(error);
                            } else {
                                console.log ("Sending Emails to " + receipentEmails);
                                console.log('Message sent: ' + info.response);                                
                            }
                        });
                    }
                });
            });
        }
     });
}

getEmailReceipentList = function (emailList, callback) {
   for (var i=0; i< emailList.length; i++ ) {
       if ( i == 0) {
           receipentEmails = emailList[i].email;
       } else {
           receipentEmails = receipentEmails + "," +emailList[i].email;                   
       }
   }
   callback (receipentEmails);    
}

