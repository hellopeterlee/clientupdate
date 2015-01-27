var express = require('express');
var router = express.Router();
var fs = require('fs');
var fse = require('fs-extra')
var async = require('async');

var lithe = require('lithe');
var path = require('path');
var hfs = lithe.hfs;
var unzip = require('unzip');
var util = require('util');
var difDiffer = require('../utils/dirDiffer');

//var moduleDir = process.cwd();
var moduleDir = path.join(__dirname,'../');
var clientupdateDirBase = path.join(moduleDir,'public','clientupdate');
var projectMenifestLocalPath = path.join(clientupdateDirBase,'project.manifest');
var versionMenifestLocalPath = path.join(clientupdateDirBase,'version.manifest');

var clientupdateArchiveName = 'updatefiles';
var clientupdateArchiveFileName = clientupdateArchiveName + '.zip';
var clientupdateZip = path.join(clientupdateDirBase,clientupdateArchiveFileName);
var clientupdateUnzipDir = path.join(clientupdateDirBase,clientupdateArchiveName);

router.get('/', function(req, res) {
    var projectMenifesttxt = fs.readFileSync(projectMenifestLocalPath, "utf8");
    var versionMenifesttxt = fs.readFileSync(versionMenifestLocalPath, "utf8");

    var projectMenifest = JSON.parse(projectMenifesttxt);
    var versionMenifest = JSON.parse(versionMenifesttxt);

    res.render('clientupdate',{
        'title': '客户端升级',
        'projectMenifest':projectMenifest,
        'versionMenifest':versionMenifest,
        'projectMenifesttxt':projectMenifesttxt,
        'versionMenifesttxt':versionMenifesttxt
    });
});

router.post('/doupdate',function(req, res) {

    var projectMenifesttxt = fs.readFileSync(projectMenifestLocalPath, "utf8");
    var versionMenifesttxt = fs.readFileSync(versionMenifestLocalPath, "utf8");

    var projectMenifest = JSON.parse(projectMenifesttxt);
    var versionMenifest = JSON.parse(versionMenifesttxt);

    !projectMenifest['assets'] && (projectMenifest['assets'] = {});

    var versionCount = 0;
    for(i in versionMenifest.groupVersions){
        versionCount = Math.max(i,versionCount);
    }
    var groupCount = 0 ;
    for(j in projectMenifest['assets']){
        groupCount = Math.max(groupCount,projectMenifest['assets'][j]['group']);
    }

    var file = req.files.file;
    if( file.size == 0 ){
        fs.unlinkSync(file.path);
    }else{
        var filePath = path.join(clientupdateDirBase, file.name);
        console.log('delfile[%s],filePath[%s]',clientupdateZip,filePath);
        fs.renameSync(filePath, clientupdateZip);
        unzipClientUpdatezipAndCheckDiff(function diffResultCB(diffFiles){
            if( diffFiles && diffFiles.length > 0 ){
                groupCount = groupCount + 1;
                for( f in diffFiles ){
                    versionCount++;
                    var versionTxt = '1.0.'+''+versionCount;
                    var changeFile = diffFiles[f]['changeFile'];
                    var realFile = diffFiles[f]['realFile'];

                    var targetFile = path.join(clientupdateDirBase,changeFile);
                    fse.copySync(realFile, targetFile);

                    !projectMenifest['assets']['update' + versionCount] && (projectMenifest['assets']['update' + versionCount] = {});
                    projectMenifest['assets']['update' + versionCount]['path'] = changeFile;
                    projectMenifest['assets']['update' + versionCount]['compressed'] = false;
                    projectMenifest['assets']['update' + versionCount]['group'] = groupCount;

                    projectMenifest.groupVersions[''+versionCount] = versionTxt;
                    versionMenifest.groupVersions[''+versionCount] = versionTxt;
                }
                projectMenifesttxt = JSON.stringify(projectMenifest);
                versionMenifesttxt = JSON.stringify(versionMenifest);
                fs.writeFileSync(projectMenifestLocalPath, projectMenifesttxt);
                fs.writeFileSync(versionMenifestLocalPath, versionMenifesttxt);
            }
            fs.unlinkSync(clientupdateZip);
            res.redirect('/clientupdate');
        });
    }

});

function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

function unzipClientUpdatezipAndCheckDiff(diffResultCB){
    console.log(util.format('start unzip[%s],clientupdateUnzipDir[%s]', clientupdateZip, clientupdateUnzipDir));
    async.waterfall([
        function(callback){
            var dirPath = clientupdateUnzipDir;
            hfs.delSync(dirPath);
            var unzipExtractor = unzip.Extract({ path: dirPath });
            unzipExtractor.on('error', function (err) {
                throw err;
            });
            unzipExtractor.on('close', function () {
                callback(null,1);
            });
            fs.createReadStream(clientupdateZip).pipe(unzipExtractor);
        },
        function(arg1, callback){
            var changed = difDiffer.get(clientupdateUnzipDir, function (item) {
                return true;
            });
            callback(null,changed);
        },
        function(changed, callback){
            console.log('changedFileList:' + JSON.stringify(changed));
            var clientupdateBaseDir = path.join(moduleDir,'public','clientupdate',clientupdateArchiveName);
            var result = [];
            var fromIndex = clientupdateBaseDir.split(path.sep).length;
            fromIndex = fromIndex ? fromIndex : 0 ;
            for( f in changed ){
                var cgFile = changed[f];
                var changeFile = cgFile.split(path.sep).slice(fromIndex).join('/');
                result.push({'changeFile':changeFile,'realFile':cgFile});
            }
            callback(null, result);
        }
    ], function (err, result) {
        diffResultCB && diffResultCB(result);
        console.log('changedFileList done result >>>' + JSON.stringify(result) );
    });
}

module.exports = router;