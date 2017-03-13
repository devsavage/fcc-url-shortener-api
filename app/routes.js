var Chance = require("chance");
var chance = new Chance();

module.exports = (app, db) => {
    app.get('/', (req, res) => {
        res.sendFile(process.cwd() + '/public/index.html');
    })
    
    app.get('/:url', (req, res) => {
        var url = process.env.APP_URL + req.params.url;
        
        if(url != process.env.APP_URL + 'favicon.ico') {
            search(url, db, res);
        }
    })
    
    app.get('/shorten/:url*', (req, res) => {
        var url = req.url.split('/shorten/')[1];
        
        var data = {};
        
        if(validate(url)) {
            data = {
                "original": url,
                "shortened": process.env.APP_URL + shortened()
            };
            
            res.send(data);
            save(data, db);
        } else {
            data = {
                error: "Invalid URL"
            };
            
            res.send(data);
        }
        
    })
    
    function validate(url) {
        var regex = /\(?(?:(http|https|ftp):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?\)?/gi;
        
        return regex.test(url);
    }
    
    function shortened() {
        var short = chance.string({
            length: 5,
            pool: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        });
        
        return short;
    }
    
    function save(data, db) {
        var sites = db.collection("sites");
        
        sites.save(data, (err, results) => {
            if(err) throw err;
            console.log("Saved " + results);
        });
    }
    
    function search(url, db, res) {
        var sites = db.collection("sites");
        
        sites.findOne({
            shortened: url
        }, (err, result) => {
            if(err) throw err;
            
            if(result) {
                console.log("Shortened URL Found: " + result);
                console.log("Redirecting to: " + result.original);
                res.redirect(result.original);
            } else {
                res.send({
                    "error": "Unknown URL"
                })
            }
        });
    }
}