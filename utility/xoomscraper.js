exports.checkXoomValue = function (request, cheerio, client, callback) {
    
    url = 'http://localhost:3003/';
    
	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);
			var newRate = { rate : ""};

			$('.fx-rate').filter(function(){
		        rate = $(this).first().text();           
		        newRate.rate = rate;
	        })

		} else {
            console.log ("Error after making request to URL");
        }
        isRateChanged(client, function (oldRateFrmDB) {
            console.log ("Old Rate is.." + oldRateFrmDB);
            if (newRate.rate.slice(7,-6).trim() == oldRateFrmDB.trim()) {
                console.log ("No need to send Emails");
            } else {
                console.log ("Need to send Emails..");
                saveNewRate (client, newRate.rate.slice(7,-6).trim());
                callback ( );
            }
            
        });
	});
}

isRateChanged = function (client, callback) {
    client.query('select rate from ratetracker ORDER BY timestamp DESC LIMIT 1', function (err, result) { 
        if (err) {
            console.error(err);
        } else {
           callback(result.rows[0].rate);            
        }
    });     
}

saveNewRate = function (client, newRate) {
    client.query('insert into ratetracker (rate) values ($1)',[newRate],function (err, result) {
        if (err) {
            console.error(err);
        } else {
           console.log ("New rate persisted");            
        }        
    });
}