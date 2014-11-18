var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index');
});

router.get('/terms', function(req, res) {
    res.render('terms');
});

router.post ('/addSubscription', function (req, res) {
    console.log ("Inside POST.." + req.body.email);
    //If new email, display thanks for subscription
    res.render('index', {message: "You will receive notification whenever the rate changed"})
    //If existing email, throw err
});



module.exports = router;
