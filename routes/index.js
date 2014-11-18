var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index');
});

router.get('/terms', function(req, res) {
    res.render('terms');
});

router.post ('/', function (req, res) {
    console.log ("Inside POST");
});



module.exports = router;
