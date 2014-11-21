var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {option:'Subscribe', action:"/addSubscription"});
});

router.get('/addSubscription', function(req, res) {
    res.render('index', {option:'Subscribe', action:"/addSubscription"});
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
    
    client.query('select email, subscribed from xoomercustomer', function (err, result) {
        if (err) { 
            console.error(err); 
        } else {
            checkForSubscription (result, req.body.email, function (alreadySubscribed, renewedSubscribed, newlySubscribed) {    
                console.log ( "OL " + alreadySubscribed + " RN " + renewedSubscribed + " NW " + newlySubscribed);
                if (alreadySubscribed) {
                    client.query('update xoomercustomer set subscribed = \'N\', unjoined = $1 where email= $2', [new Date( ), req.body.email], function (err, result) { 
                        if (err) {
                            console.log ("Err in update " + err);
                            res.render('index', {message: "Some error occured, try again later !!!", option:'Unsubscribe', action:"/removeSubscription"});                            
                        } else {
                            res.render('index', {message: "Sorry to see you leaving, you can subscribe back by entering again !!!", option:'Subscribe', action:"/addSubscription"});                            
                        }
                    });

                } else if (renewedSubscribed) {
                    res.render('index', {message: "You are already unsubscribed, you can subscribe back by entering again !!!", option:'Subscribe', action:"/addSubscription"});
                } else if (newlySubscribed){
                    res.render('index', {message: "You haven't subscribed at all, you can subscribe newly above !!!", option:'Subscribe', action:"/addSubscription"});
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
    
    client.query('select email, subscribed from xoomercustomer', function(err, result) {
    if (err) { 
        console.error(err); 
    }
    else { 
          checkForSubscription (result, req.body.email, function (alreadySubscribed, renewedSubscribed, newlySubscribed) {
          console.log ( "OL " + alreadySubscribed + " RN " + renewedSubscribed + " NW " + newlySubscribed);
          if (alreadySubscribed) {
                res.render('index', {message: "You are already subscribed !!!", option:'Subscribe',action:"/addSubscription"});
          } else if (renewedSubscribed) {
                client.query ('update xoomercustomer set subscribed = \'Y\', rejoined = $1 where email= $2', [new Date( ), req.body.email], function (err, result) { 
                    if (err) {
                        console.log ("Error in update " + err);
                        res.render('index', {message: "Some error occured, try again later !!!",option:'Subscribe',action:"/addSubscription"});
                    } else {
                        res.render('index', {message: "Thanks for subscribing again !!!",option:'Subscribe',action:"/addSubscription"});
                    }
                });                
          } else if (newlySubscribed){
                client.query('insert into xoomercustomer (email, subscribed) values ($1, \'Y\')',[req.body.email],function (err, result) {
                    if (err) {
                        console.log ("Error in Create " + err);
                        res.render('index', {message: "Some error occured, try again later !!!",option:'Subscribe',action:"/addSubscription"});
                    } else {
                        res.render('index', {message: "You will receive notification whenever the rate changes !!!",option:'Subscribe',action:"/addSubscription"})
                    }
                });
                
          }
        });
        }
    });
});

checkForSubscription = function (result, email, callback ) {
   for (var i=0; i<result.rows.length; i++ ) {
       if (email == result.rows[i].email && result.rows[i].subscribed == 'Y') {
           alreadySubscribed = true;
           renewedSubscribed = false;
           newlySubscribed = false;
           break;
       } else if (email == result.rows[i].email && result.rows[i].subscribed == 'N') {  
           renewedSubscribed = true;
           alreadySubscribed = false;
           newlySubscribed = false;
           break;
       } else { 
           newlySubscribed = true;
           alreadySubscribed = false;
           renewedSubscribed = false;
       }
   } 
    callback (alreadySubscribed, renewedSubscribed, newlySubscribed);
}


module.exports = router;
