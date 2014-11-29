var path = require('path');
var fs = require('fs');
var esprima = require('esprima-fb');
var falafel = require('falafel');
var temp = require('temp');
var wrench = require('wrench');
var exec = require('child_process').exec;

var TEMP_DIR_NAME = 'flownotate';
var EXCLUDED_PATHS = /(\.git)/;
var ELIGIBLE_FILE_EXTS = [ '.js', '.jsx' ];
var TRIGGER_PATTERN = /^\/\* *@flow/;
var ASSUMED_ENCODING = 'utf8';

function debug(object) {
    console.log(JSON.stringify(object, undefined, 4));
}

function jsToAst(jsSource, opts) {
    opts = opts || {};
    opts.range = true;
    opts.attachComment = true;
    return esprima.parse(jsSource, opts);
}

function commentToFlowType(flownotateString) { // => flowTypeString
    return flownotateString.replace(/\/\*:\s*(.+?)\s*\*\//, ': $1');
}

function jsToJsx(jsSource) {
    return '' + falafel(jsSource, { parse: jsToAst }, function(node) {
        if (node.type === 'Block') {
            node.update(commentToFlowType(node.source()));
        }
    });
}

exports.jsToJsx = jsToJsx;

function transformFileInPlace(filePath) {
    if (ELIGIBLE_FILE_EXTS.indexOf(path.extname(filePath)) === -1) {
        return; // uninteresting file type
    }
    var fileContent = fs.readFileSync(filePath, ASSUMED_ENCODING);
    if (!TRIGGER_PATTERN.test(fileContent)) {
        return; // non-flow-annotated file // TODO: What about $ flow check --all though..?
    }
    //console.log('Transformed: ' + filePath);
    fs.writeFileSync(filePath, jsToJsx(fileContent), { encoding: ASSUMED_ENCODING });
}

function translatePathsInOutput(flowCmdOutput, sourceDir, tempDir) {
    return flowCmdOutput.replace(new RegExp('(?:/private)' + tempDir, 'g'), sourceDir);
}

function flowCheck(sourceDir) {
    sourceDir = path.resolve(sourceDir);
    //console.log('Source path: ' + sourceDir);
    temp.track(); // automatically track and cleanup files at exit
    var tempDir = path.join(temp.mkdirSync(TEMP_DIR_NAME), TEMP_DIR_NAME);
    wrench.copyDirSyncRecursive(sourceDir, tempDir, { exclude: EXCLUDED_PATHS });
    process.chdir(tempDir);
    //console.log('Workspace path: ' + tempDir);
    wrench.readdirSyncRecursive('.').forEach(transformFileInPlace);
    exec('flow check', function(err, stdout, stderr) { // TODO: Retain colors in output..?
        if (stderr) {
            console.log(stderr);
            process.exit(1);
        } else {
            console.log(translatePathsInOutput(stdout + '', sourceDir, tempDir));
            process.exit(err ? 1 : 0); // TODO: Proxy actual exit value instead..?
        }
    });
}

exports.flowCheck = flowCheck;
