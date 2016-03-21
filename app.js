/* Close5 Code Challenge
​
In this coding challenge, I'm requesting that you create and API server preferably using express 4, but you can also use other http server frameworks (or none at all). If you do please comment in the code explaining why you did this.
​
Below you will find a large JSON array of objects. These objects are small representations of items that people have listed for sale on Close5. With your API server, I would like you to use this static array as your database and created 1 or more http routes that return this data as JSON in various different ways. They include:
​
* The entire list sorted by creation date (Ascending and Descending)
* The entire listed sorted by the item’s price (Ascending and Descending)
* Any single item by its id
* An array of items based on any userId
* A route to request for items within 50 miles of their location coordinates
​
The file(s) should be bundled up into one node project so that I can just run `node app.js`. I should then be able to hit localhost:8080 which will give me some kind of guide as to how to navigate your API.
​
Feel free to ask any questions or for clarity on the challenge. You can email me the zip file or send me a github link
​
Good luck!
​
​
*/

var db = require('./items.json');
var express = require('express');
var app = express();
var port = 8080;

function isDistanceWithinRadius(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var theta = lon1 - lon2;
	var radtheta = Math.PI * theta/180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;
    console.log(dist)
	return dist <= 50;
}


app.get('/', function(req, res) {
    res.send('Hello, Evan');
});


// find one
app.get('/items/:itemId', function(req, res){
    // item id: 53fbe21c456e74467b000006
    var itemId = req.params.itemId;

    if(itemId.length !== 24){
        res.send('Invalid Item ID!')
    }

    var matchingItem = db.find(function(item){
        return item.id === itemId;
    });

    if(matchingItem){
        res.send(matchingItem);
    }else{
        res.send('Item not found.')
    }
});

// find nearby
app.get('/items/all/nearby', function(req, res){
    var myXPos = 36.725;
    var myYPos = -115.715;

    // html5 geolocation
    var nearbyItems = db.filter(function(item, i){
        var itemXPos = item.loc[0];
        var itemYPos = item.loc[1];

        return isDistanceWithinRadius(itemXPos, itemYPos, myXPos, myYPos);
    });

    res.send(nearbyItems);
});

// get user id
app.get('/items/user/:userId', function(req, res){
    // user id: 53f6c9c96d1944af0b00000b
    var userId = req.params.userId;

    if(userId.length !== 24){
        res.send('Invalid User ID!')
    }

    var matchingItems = db.filter(function(item, i){
        return item.userId === userId;
    });

    if(matchingItems.length){
        res.send(matchingItems);
    }else{
        res.send('This user does not have any items.');
    }
});


// oldest to newest
app.get('/items/asc/sort/created', function(req, res){
    var newToOldItems = db.sort(function(a,b){
        // convert into timestamps
        return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime();
    });
    res.send(newToOldItems);
});

// newest to oldest
app.get('/items/des/sort/created', function(req, res){
    var oldToNewItems = db.sort(function(a,b){
        // convert into timestamps
        return new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime();
    });;
    res.send(oldToNewItems);
});

// lowest to highest
app.get('/items/asc/sort/price', function(req, res) {
    var lowToHighPriceItems = db.filter(function(e){ return e.price > -1 }).sort(function(a,b){
        return a.price > b.price;
    });
    res.send(lowToHighPriceItems);
});

// highest to lowest
app.get('/items/des/sort/price', function(req, res) {
    var highToLowPriceItems = db.filter(function(e){ return e.price > -1 }).sort(function(a,b){
        return a.price < b.price;
    });
    res.send(highToLowPriceItems);
});

app.listen(port, function() {
    console.log('----------------------------');
    console.log('--- App running on ' + port + ' ----');
    console.log('----------------------------');
});
