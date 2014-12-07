exports.timeCheck = function (callback) {
    timeInReqZone ('+5.5', function (timeIndia) {   
        console.log ("Time in India.." + timeIndia);
        var hrs = timeIndia.getHours( );
        console.log ("Hrs for comparison " + hrs);
        
        if (hrs >= 9 && hrs <= 21) {
            console.log ("We can run the process");
            callback (true);
        } else {
            console.log ("Dnt run");
            callback (false);
        }        
    });
    
}

timeInReqZone = function (offset, callback) {
    var localDate = new Date();
    var utc = localDate.getTime() + (localDate.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000*offset));  
    console.log ("Newer date.." + nd);
    callback (nd);
}