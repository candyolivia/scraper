var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){
	url = 'http://m.bnizona.com/index.php/category/index/promo';
  	request(url, function (error, respons, html) {
  		if (!error) {
  			var $ = cheerio.load(html);

  			var json = { menu : "" , url : ""};

  			$('li > a').each(function(){
  				var data = $(this);
  				var text = data.text();
    			var href = data.attr("href");

    			console.log(text + " -> " + href);
  				
  				json.menu = text;
  				json.url = href;	

  				fs.appendFile('mainmenu.json',JSON.stringify(json,null,4), function(err){
					
				})
  				
  			})
  		}
 
	res.send('Check mainmenu.json file!')

  		
  	});

})

app.listen('8081')

exports = module.exports = app; 