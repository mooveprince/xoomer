var express = require('express');
var router = express.Router();
var request = require('request');

var url = process.env.SERVICE_URL || "http://localhost:3003/services";
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index',{option:'Subscribe', action:"/addSubscriber"});
});

router.get('/addSubscriber', function(req, res) {
  res.render('index',{option:'Subscribe', action:"/addSubscriber"});
});

router.get('/removeSubscription', function(req, res) {
    res.render('index', {option:'Unsubscribe',action:"/removeSubscription"});
});

router.post('/addSubscriber', function (req, res) {
    var userDetailUrl = url + '/subscriberDetail';
    var addUrl = url+'/addSubscriber';
    var reactivateUrl = url + '/reactivatateSubscription' ;
    
    request.post ( {url:userDetailUrl, form: {email:req.body.email}, json:true },
                  function (err, data, body) {
                    if (err) {
                        res.render('index',{option:'Subscribe', action:"/addSubscriber", message: "Some error occured, try again later !" });
                    } else if (body.subscriberDetail.existingUser) {    //check whether he is existing user
                        if (body.subscriberDetail.subscriptionStatus == 'Y') {  //check whether active user
                            res.render('index', {message: "You are already subscribed !", option:'Subscribe', action:"/addSubscriber"});
                        } else {
                            request.post( {url:reactivateUrl, form: {email:req.body.email}, json:true }, 
                                       function (err, data, body) {
                                        if (body.reactivated) {
                                            res.render('index',{option:'Subscribe', action:"/addSubscriber", message: "Thanks for subscribing again !" });                
                                        } else {
                                            res.render('index',{option:'Subscribe', action:"/addSubscriber", message: "Some error occured, try again later !" });                                
                                        }     
                                });                             
                        }
                    } else {
                        request.post( {url:addUrl, form: {email:req.body.email}, json:true }, 
                                   function (err, data, body) {
                                    if (body.inserted) {
                                        res.render('index',{option:'Subscribe', action:"/addSubscriber", message: "You will receive notification whenever the rate changes !" });                
                                    } else {
                                        res.render('index',{option:'Subscribe', action:"/addSubscriber", message: "Some error occured, try again later !" });                                
                                    }     
                            });                        
                    }
                  });
});

router.post ('/removeSubscription', function (req, res) { 
    var userDetailUrl = url + '/subscriberDetail';
    var deactivateUrl = url + '/deactivatateSubscription';
    
    request.post ( {url:userDetailUrl, form: {email:req.body.email}, json:true },
                  function (err, data, body) {
                    if (err) {
                        res.render('index',{option:'Unsubscribe', action:"/removeSubscription", message: "Some error occured, try again later !" });
                    } else if (body.subscriberDetail.existingUser) { //check for existing user
                        if (body.subscriberDetail.subscriptionStatus == 'Y') { //check if they are actively subscribed
                            request.post( {url:deactivateUrl, form: {email:req.body.email}, json:true }, 
                                       function (err, data, body) {
                                        if (body.removed) {
                                            res.render('index',{option:'Subscribe', action:"/addSubscriber", message: "Sorry to see you leaving, you can subscribe back by entering again !" });                
                                        } else {
                                            res.render('index',{option:'Unsubscribe', action:"/removeSubscription", message: "Some error occured, try again later !" });                                
                                        }     
                                });                                                    
                        } else {
                            res.render('index',{option:'Subscribe', action:"/addSubscriber", message: "You are already unsubscribed, you can subscribe back by entering again !" });                          
                        }
                    } else {
                        res.render('index',{option:'Subscribe', action:"/addSubscriber", message: "You haven't subscribed at all, you can subscribe newly above !" });     
                    }
        });
    
});

module.exports = router;
