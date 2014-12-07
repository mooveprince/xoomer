var request = require('request');
var sendMail = require ('./mailsender');

exports.rateCheckAndSendEmail =  function (url, callback) {
    var rateCheckUrl = url + '/isRateChanged';
    var rateChangedTemplate = process.cwd() + '/utility/rateChangeMail.html';
    var persistNewRateUrl = url + '/persistRate';
    
    request({url:rateCheckUrl, json:true}, function (error, response, body ) {
        if (body.isRateChanged ) {
            console.log ("Need to send emails");
            sendMail.rateChangedMail (url, body.persistedRate, body.rateFromXoom);
            request.post ({url:persistNewRateUrl, form: {newRate:body.rateFromXoom}, json:true },
                          function (error, data, body) {
                            if (error) {
                                console.log ("Error in inserting the new rate");
                            } else if (body.inserted) {
                                console.log ("New value is persisted");
                            } 
                        } );
            callback (true);
        } else {
            console.log ("No need to send emails");
            callback (false);
        }
    });
}