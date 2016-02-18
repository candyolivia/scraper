var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var promise = require('promise');
var app     = express();

app.get('/scrape_all', function(req, res){
  var menu = [];
  var menulink = [];
  var url = 'http://m.bnizona.com/index.php/category/index/promo';

  var reqParent = function(url) {
    return new promise(function(resolve, reject) {
      request(url, function (error, respons, html) {
        if (!error) {
          var $ = cheerio.load(html);
          
          var res = [];
          $('ul.menu > li > a').each(function(json){
            var data = $(this);
            var text = data.text();
            var href = data.attr("href");

            //console.log(text + " -> " + href);
            
            var ret = {name: text, link: href};
            //console.log(ret);
            res.push(ret);
          });

          resolve(res);
        } else {
          reject(error);
        }
      });
    });
  };

  var childReq = function($,submenu) {
    return new promise(function(resolve,reject) {
      var r = [];
        var json = {};
        $('.list2 > li > a > span.merchant-name').each(function() {
          var at = $(this).parent();
          var ret = {};

          ret.url = at.attr("href");
          ret.title = at.children('.merchant-name').text();
          ret.content = at.children('.merchant-name').next().text();
          ret.validDate = at.children('.merchant-name').next().next().text();
          ret.image = at.children('img').attr("src");  
          
          //console.log(ret);
          r.push(ret);
          
        });

        for (var a in submenu) {
          json[submenu] = r;
        }
        
        console.log(json);
        resolve(json);
    });
  }

  var processCategoryPage = function(req) {
    return new promise(function(resolve, reject) {
      url = req.link;
      request(url, function( error, respons, html ) {
        if (error) {
          reject(error);
        } else {
          var $ = cheerio.load(html);
          var submenu = req.name;
          var json = [];
          childReq($,submenu).then(
            function(res) {
              //json.push(res);
              resolve(res);
            }, function(res) {

            });
        }
      });
    });
  };

  reqParent(url).then(
    function(res) {
      //console.log(res);
      
      var actions = res.map(processCategoryPage);
      var results = Promise.all(actions); 

      results.then(function(res) {
        //json.push(res);
        console.log(res);
      });
    },
    function(res) {
      console.log(res);
    }
  );

	res.send('Check Console!')
		
	})

app.listen('8081')

exports = module.exports = app; 