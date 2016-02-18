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

/*
    requesting.then(
      function() {
        console.log(arrsize);
        var i = 0;
        var url = menulink[i];
        while (i < arrsize) {
          var childrequest = new promise(function(resolve,reject) {
            console.log(menu[i]);
            url = menulink[i];
            request(url, function (error, respons, html) {
              if (!error) {
                var $ = cheerio.load(html);

                var title, url, image, content, validdate;

                var json = { title : "" , image : "", url : "", content : "", validdate : ""};

                $('.list2 > li > a > span.merchant-name').each(function(){
                  var at = $(this).parent();
                  var url = at.attr("href");
                  var title = at.children('.merchant-name').text();
                  var content = at.children('.merchant-name').next().text();
                  var validdate = at.children('.merchant-name').next().next().text();
                  var image = at.children('img').attr("src");

                  json.title = title;
                  json.image = image;
                  json.url = url;
                  json.content = content;
                  json.validdate = validdate;

                  console.log (url + "," + title + "," + image + "," + content + "," + validdate);

                })

              }
            })
          });


          childrequest.then (
            function(){
              //console.log(menu[i]);
              //console.log(menulink[i]);
              console.log("hahahahaha");
            },
            function() {
              console.log("yeay");
            })


          i++;
          
          //console.log(arr.url[i]);
        }
      },
      function() {
        console.log("rejected request");
      }*/
//    );
    

	/*url = 'http://m.bnizona.com/index.php/promo/index/16';
  	request(url, function (error, respons, html) {
  		if (!error) {
  			var $ = cheerio.load(html);

        var title, url, image, content, validdate;

  			var json = { title : "" , image : "", url : "", content : "", validdate : ""};

  			$('.list2 > li > a > span.merchant-name').each(function(){
  				var at = $(this).parent();
          var url = at.attr("href");
          var title = at.children('.merchant-name').text();
          var content = at.children('.merchant-name').next().text();
          var validdate = at.children('.merchant-name').next().next().text();
  				var image = at.children('img').attr("src");

          json.title = title;
          json.image = image;
          json.url = url;
          json.content = content;
          json.validdate = validdate;

          console.log (url + "," + title + "," + image + "," + content + "," + validdate);
  			})

  		}*/
 
	res.send('Check scrape_all.json file!')

  		
  	})

app.listen('8081')

exports = module.exports = app; 