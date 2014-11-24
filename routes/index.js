var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {option:'Subscribe', action:"/addSubscription"});
});

router.get('/addSubscription', function(req, res) {
    res.render('index'  , {option:'Subscribe', action:"/addSubscription"});
});

router.get('/removeSubscription', function(req, res) {
    res.render('index', {option:'Unsubscribe',action:"/removeSubscription"});
});

router.get('/terms', function(req, res) {
    res.render('terms');
});

router.post('/removeSubscription', function (req, res) {
    var client = req.client;
    var alreadySubscribed = false;
    var renewedSubscribed = false;
    var newlySubscribed = false;
    var async = req.async;
    
    client.query('select email, subscribed from xoomercustomer', function (err, result) {
        if (err) { 
            console.error(err); 
        } else {
            checkForSubscription (async, result, req.body.email, function (alreadySubscribed, renewedSubscribed) {    
                console.log ( "OL " + alreadySubscribed + " RN " + renewedSubscribed );
                if (alreadySubscribed) {
                    alreadyActiveSubscribedHandler (res, false, true, client, req);
                } else if (renewedSubscribed) {
                    renewedSubscribedHandler (res, false, true, client, req);
                } else {
                    newlySubscribedHandler (res, false, true, client, req);
                }
            });
        }
    });
    
});

router.post ('/addSubscription', function (req, res) {
    //If new email, display thanks for subscription
    var client = req.client;
    var alreadySubscribed = false;
    var renewedSubscribed = false;
    var newlySubscribed = false;
    var async = req.async;
    
    client.query('select email, subscribed from xoomercustomer', function(err, result) {
    if (err) { 
        console.error(err); 
    }
    else { 
          console.log ("Before calling the checkSubscrib");
          checkForSubscription (async, result, req.body.email, function (alreadySubscribed, renewedSubscribed) {
              console.log ( "OL " + alreadySubscribed + " RN " + renewedSubscribed );
              if (alreadySubscribed) {
                    alreadyActiveSubscribedHandler (res, true, false, client, req);
              } else if (renewedSubscribed) {
                    renewedSubscribedHandler (res, true, false, client, req);
              } else {
                    newlySubscribedHandler (res, true, false, client, req);
              }
            });
        }
    });
});

checkForSubscription = function (async, result, email, callback ) {
    if (result.rows.length == 0) {
        callback (false, false);
    } else {
        var results = {
            alreadySubscribed :false,
            renewedSubscribed :false   
        }
        
        async.map (result.rows,
                    function (row, doneCallback) {
                        if (email == row.email && row.subscribed == 'Y') {
                            console.log ("Already subscribed");
                            results.alreadySubscribed = true;
                        } else if (email == row.email && row.subscribed == 'N') {
                            console.log ("Renewed Subscribe");
                            results.renewedSubscribed = true;
                        }
                        doneCallback (null,results);   
                    }, 
                    function (err, results) { 
                        console.log ("Inside callback..");
                        callback ( results[0].alreadySubscribed, results[0].renewedSubscribed );
                    } );
                            
    }
}

alreadyActiveSubscribedHandler = function (res, subscription, unsubscription, client, req) {
    if (subscription) {
        res.render('index', {message: "You are already subscribed !", option:'Subscribe',action:"/addSubscription"});
    }
    if (unsubscription) {
        client.query('update xoomercustomer set subscribed = \'N\', unjoined = $1 where email= $2', [new Date( ), req.body.email], function (err, result) { 
            if (err) {
                console.log ("Err in update " + err);
                res.render('index', {message: "Some error occured, try again later !", option:'Unsubscribe', action:"/removeSubscription"});                            
            } else {
                res.render('index', {message: "Sorry to see you leaving, you can subscribe back by entering again !", option:'Subscribe', action:"/addSubscription"});                            
            }
        });        
    }
}

renewedSubscribedHandler = function (res, subscription, unsubscription, client, req) {
    if (subscription) {
        client.query ('update xoomercustomer set subscribed = \'Y\', rejoined = $1 where email= $2', [new Date( ), req.body.email], function (err, result) { 
            if (err) {
                console.log ("Error in update " + err);
                res.render('index', {message: "Some error occured, try again later !", option:'Subscribe', action:"/addSubscription"});
            } else {
                res.render('index', {message: "Thanks for subscribing again !",option:'Subscribe',action:"/addSubscription"});
            }
        });          
    }
    if (unsubscription) { 
        res.render('index', {message: "You are already unsubscribed, you can subscribe back by entering again !", option:'Subscribe', action:"/addSubscription"});        
    }
}

newlySubscribedHandler = function (res, subscription, unsubscription, client, req) {
    console.log ("Inside New mehtod");
    if (subscription) {
        client.query('insert into xoomercustomer (email, subscribed) values ($1, \'Y\')',[req.body.email],function (err, result) {
            if (err) {
                console.log ("Error in Create " + err);
                res.render('index', {message: "Some error occured, try again later !", option:'Subscribe', action:"/addSubscription"});
            } else {
                req.sm.sendMail (req.nodemailer, req.smtpPool, req.client, req.fs, req.subscribedTemplate, req.mustache, true, req.body.email);
                res.render('index', {message: "You will receive notification whenever the rate changes !", option:'Subscribe', action:"/addSubscription"});
            }
        });        
    }
    if (unsubscription) {
        res.render('index', {message: "You haven't subscribed at all, you can subscribe newly above !", option:'Subscribe', action:"/addSubscription"});        
    }
    
}

module.exports = router;
