/**
 * @author peirenlei
 * @email peirenlei@163.com
 * @fileoverview 获取路径下变化的文件列表
 */
var lithe = require('lithe');
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');
var hfs = lithe.hfs;

var moduleDir = path.join(__dirname, '../');

function getMd5(p) {
    var str = fs.readFileSync(p, 'utf-8');
    var md5um = crypto.createHash('md5');
    md5um.update(str);
    return md5um.digest('hex');
}

function DirDiffer() {
    this.database = path.join(moduleDir, '.prl');
    if (!fs.existsSync(this.database)) {
        hfs.writeFileSync(this.database, '{}', 'utf-8');
    }
}


var clientupdateDirBase = path.join(moduleDir, 'public', 'clientupdate');
var clientupdateArchiveName = 'updatefiles';
var clientupdateBaseDir = path.join(clientupdateDirBase, clientupdateArchiveName);

DirDiffer.prototype = {
    constructor: DirDiffer,
    get: function (p, filter) {
        var self = this,
            base = fs.readFileSync(this.database),
            changedList = [],
            files;
        base = JSON.parse(base);
        hfs.walk(p, function (lists, a) {
            files = lists;
            files.forEach(function (filepath) {
                var md5str = getMd5(filepath);

                var fromIndex = clientupdateBaseDir.split(path.sep).length;
                fromIndex = fromIndex ? fromIndex : 0;
                var _filePath = filepath.split(path.sep).slice(fromIndex).join('/');

//                if (!base[filepath] || (base[filepath] && base[filepath] !== md5str)) changedList.push(filepath);
                if (!base[_filePath] || (base[_filePath] && base[_filePath] !== md5str)) changedList.push(filepath);

                base[_filePath] = md5str;
            });
            hfs.writeFileSync(self.database, JSON.stringify(base), 'utf-8');
        }, {
            filter: filter
        });
        return changedList;
    }
};

module.exports = new DirDiffer();