exports.sendMail = function (nodemailer, smtpPool, client, fs, template, mustache, isSubscription, newEmail) {
    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport(smtpPool({
        service: 'Gmail',
        auth: {
            user: 'ratecheckxoomer@gmail.com',
            pass: 'rate@xoom123'
        },
        maxConnections: 3,
        maxMessages: 10        
    }));  
    
    if (isSubscription) {
        var sendEmails = getCurrentRate (client, function (currentValue) {
                fs.readFile(template, 'utf8', function (err, file) {
                    if (err) {
                        console.log ("Error occurred in reading the template" + err);
                    } else {
                        var htmlMsg = mustache.to_html(file, {currentValue: currentValue});
                        var textMsg = 'Welcome, Current Xoom Rate to India is ' + currentValue ;
                        var mailOptions = {
                            from: 'Xoomer Admin <ratecheckxoomer@gmail.com>',
                            bcc: newEmail,
                            subject: 'Welcome aboard!',
                            text: textMsg,
                            html: htmlMsg
                        };

                        transporter.sendMail(mailOptions, function(error, info){
                            console.log ("Sending Emails to " + newEmail);
                            if(error){
                                console.log(error);
                            }else{
                                console.log('Message sent: ' + info.response);
                            }
                        }); 
                    }
                });             
        });
        
        
        } else {
        var sendEmails = getEmailReceipentList (client, function (receipentEmails) {
            getRateList (client, function (newValue, oldValue) {
                console.log ("Before reading the file.." + template);
                fs.readFile(template, 'utf8', function (err, file) {
                    if (err) {
                        console.log ("Error occurred in reading the template" + err);
                    } else {
                        var htmlMsg = mustache.to_html(file, {oldValue: oldValue, newValue:newValue});
                        var textMsg = 'Value changed from ' + oldValue + ' to ' + newValue;
                        var mailOptions = {
                            from: 'Xoomer Admin <ratecheckxoomer@gmail.com>',
                            bcc: receipentEmails,
                            subject: 'Rate Changed',
                            text: textMsg,
                            html: htmlMsg
                        };

                        transporter.sendMail(mailOptions, function(error, info){
                            console.log ("Sending Emails to " + receipentEmails);
                            if(error){
                                console.log(error);
                            }else{
                                console.log('Message sent: ' + info.response);
                            }
                        }); 
                    }
                });            
            });
        });
    }
}

getEmailReceipentList = function (client, callback) {
    client.query('select email from xoomercustomer where subscribed = \'Y\'', function(err, result) {
      if (err) { 
        console.error(err); 
      }
      else
       { 
           for (var i=0; i<result.rows.length; i++ ) {
               if ( i == 0) {
                   receipentEmails = result.rows[i].email;
               } else {
                   receipentEmails = receipentEmails + "," +result.rows[i].email;                   
               }
           }
           callback(receipentEmails);
       }
    }); 
}

getRateList = function (client, callback) {
    client.query('select rate from ratetracker ORDER BY timestamp DESC LIMIT 2', function (err, result) { 
        if (err) {
            console.error(err);
        } else {
           callback(result.rows[0].rate, result.rows[1].rate);            
        }
    });    
}

getCurrentRate = function (client, callback) {
    client.query('select rate from ratetracker ORDER BY timestamp DESC LIMIT 1', function (err, result) { 
        if (err) {
            console.error(err);
        } else {
           callback(result.rows[0].rate);            
        }
    });    
}

