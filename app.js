/* Close5 Code Challenge
​
Notes:
-Did not include MongoDB/Mongoose, but functionality should be similar (findOne, find, etc.) Happy to discuss these technologies.
-Thought of combining the item sort endpoint, but figured it'd be best to keep it all separate.
-If I were to keep working on this, I'd construct an appropriate file structure, with models, tests, endpoints, etc. grouped appropriately.
-Would expand error handling, especially in PUT/POST endpoints to ensure uncompromised data
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
    res.send(
        'Hello, Close5!</br>'+
        '1. Get One Item - localhost:8080/items/53fbe21c456e74467b000006</br>'+
        '2. Get Nearby Items - localhost:8080/items/all/nearby</br>'+
        '3. Get User Items - localhost:8080/items/user/53f6c9c96d1944af0b00000b</br>'+
        '4. Get Oldest Items - localhost:8080/items/sort/asc/created</br>'+
        '5. Get Newest Items - localhost:8080/items/sort/des/created</br>'+
        '6. Get Cheapest Items - localhost:8080/items/sort/asc/price</br>'+
        '7. Get Most Expensive Items - localhost:8080/items/sort/des/price</br>'
    );
});


// find one
app.get('/items/:itemId', function(req, res){
    // item id: 53fbe21c456e74467b000006
    var itemId = req.params.itemId;

	// check for invalid alphanumeric id
    if(itemId.length !== 24){
        res.send('Invalid Item ID!')
    }

    var matchingItem = db.find(function(item){
        return item.id === itemId;
    });

	// if resul, return result
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

	// check for invalid alphanumeric id
    if(userId.length !== 24){
        res.send('Invalid User ID!')
    }

    var matchingItems = db.filter(function(item, i){
        return item.userId === userId;
    });

	// if results, return results
    if(matchingItems.length){
        res.send(matchingItems);
    }else{
        res.send('This user does not have any items.');
    }
});


// oldest to newest
app.get('/items/sort/asc/created', function(req, res){
    var newToOldItems = db.sort(function(a,b){
        // convert into timestamps
        return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime();
    });
    res.send(newToOldItems);
});

// newest to oldest
app.get('/items/sort/des/created', function(req, res){
    var oldToNewItems = db.sort(function(a,b){
        // convert into timestamps
        return new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime();
    });;
    res.send(oldToNewItems);
});

// lowest to highest
app.get('/items/sort/asc/price', function(req, res) {
	// filter out all items without a price, then sort
    var lowToHighPriceItems = db.filter(function(e){ return e.price > -1 }).sort(function(a,b){
        return a.price > b.price;
    });
    res.send(lowToHighPriceItems);
});

// highest to lowest
app.get('/items/sort/des/price', function(req, res) {
	// filter out all items without a price, then sort
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
