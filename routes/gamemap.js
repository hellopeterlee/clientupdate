var express = require('express');
var router = express.Router();
var fse = require('fs-extra')

var lithe = require('lithe');
var path = require('path');
var moment = require('moment');

var moduleDir = path.join(__dirname,'../');
var clientMapDirBase = path.join(moduleDir,'public','gamemap');

router.get('/', function(req, res) {
    res.redirect('/gamemap');
});

router.get('/savemap', function(req, res) {
    var mapData = req.query['mapData'];
    var targetFile = path.join(clientMapDirBase, 'map(' + moment().format("YYYYMMDDHHmmss") + ").txt");
    fse.writeFileSync(targetFile, mapData);
    res.redirect('/gamemap');
});

module.exports = router;