var path = require('path');
var fs = require('fs');
var esprima = require('esprima-fb');
var falafel = require('falafel');
var temp = require('temp');
var wrench = require('wrench');
var exec = require('child_process').exec;

var TEMP_DIR_NAME = 'flotate';
var EXCLUDED_PATHS = /(\.git)/;
var ELIGIBLE_FILE_EXTS = [ '.js', '.jsx' ];
var TRIGGER_PATTERN = /^\/\* *@flow/;
var ASSUMED_ENCODING = 'utf8';
var FLOW_CONFIG_FILE = '.flowconfig';

function debug() {
    if (process.env.FLOTATE_DEBUG) {
        console.log.apply(console, ['[DEBUG]'].concat(Array.prototype.slice.call(arguments)));
    }
}

function jsToAst(jsSource, opts) {
    opts = opts || {};
    opts.range = true;
    opts.attachComment = true;
    return esprima.parse(jsSource, opts);
}

function commentToFlowType(flotateString) { // => flowTypeString
    return flotateString
        .replace(/\/\*flow-ignore-begin\*\//, '/*') // /*flow-ignore-begin*/        => /*
        .replace(/\/\*flow-ignore-end\*\//, '*/')   // /*flow-ignore-end*/          => */
        .replace(/\/\*::([\s\S]+?)\*\//, '$1');     // /*:: type BarBaz = number */ => type BarBaz = number
}

function processFunctionNode(node, body) {
    body = body || node.body;

    var source = node.source();
    var pos = body.range[0] - node.range[0];
    var header = source.substr(0, pos);
    var body = source.substr(pos);

    // First check if there is *fancy* type annotation in the leading comment
    var leadingComments = (node.id || {}).leadingComments || [];
    for (var i = 0; i < leadingComments.length; i++) {
        // /* @: (x: String, y: number): boolean
        var m = leadingComments[i].source().match(/\/\*\s*@:([\s\S]+?)\*\//);

        if (m) {
            // replace everything after first brace
            header = header.replace(/\([\s\S]*$/, m[1]);
            node.update(header + body);
            leadingComments[i].update("");
            return;
        }
    }

    // Otherwise replace in-parameter-list annotation
    header = header
        .replace(/\/\*:([\s\S]+?)\*\//g, ': $1');    // /*: FooBar */ => : FooBar

    node.update(header + body);
}

function jsToFlow(jsSource) {
    return '' + falafel(jsSource, { parse: jsToAst }, function(node) {
        if (node.type === 'MethodDefinition') {
            processFunctionNode(node, node.value.body);
        } else if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
            processFunctionNode(node);
        } else if (node.type === 'Block') {
            node.update(commentToFlowType(node.source()));
        }
    });
}

exports.jsToFlow = jsToFlow;

function transformFileInPlace(filePath) {
    if (ELIGIBLE_FILE_EXTS.indexOf(path.extname(filePath)) === -1) {
        return; // uninteresting file type
    }
    var fileContent = fs.readFileSync(filePath, ASSUMED_ENCODING);
    if (!TRIGGER_PATTERN.test(fileContent)) {
        return; // non-flow-annotated file // TODO: What about $ flow check --all though..?
    }
    debug('Transformed: ' + filePath);
    fs.writeFileSync(filePath, jsToFlow(fileContent), { encoding: ASSUMED_ENCODING });
}

function translateIncludePath(pathToTranslate, sourceDir, tempDir) {
    if (pathToTranslate.match(/^\.\.\//)) {
        return path.join(tempDir.replace(/\/[^/]+/g, '../'), '../' /* for "/private" */, sourceDir, pathToTranslate);
    } else {
        return pathToTranslate;
    }
}

exports.translateIncludePath = translateIncludePath;

function transformFlowConfig(sourceDir, tempDir) {
    var configContent = fs.readFileSync(path.join(tempDir, FLOW_CONFIG_FILE), ASSUMED_ENCODING);
    configContent = configContent.split('\n').map(function(line) {
        return line.match(/^\.\.\//) ? translateIncludePath(line, sourceDir, tempDir) : line;
    }).join('\n');
    fs.writeFileSync(path.join(tempDir, FLOW_CONFIG_FILE), configContent, { encoding: ASSUMED_ENCODING });
}

function translatePathsInOutput(flowCmdOutput, sourceDir, tempDir) {
    return flowCmdOutput.replace(new RegExp('(?:/private)' + tempDir, 'g'), sourceDir);
}

function flowCheck(sourceDir) {
    sourceDir = path.resolve(sourceDir);
    debug('Source dir: ' + sourceDir);
    var flowconfig = path.join(sourceDir, FLOW_CONFIG_FILE);
    if (!fs.existsSync(flowconfig)) {
        throw new Error('Expected config file "' + flowconfig + '" does not exist');
    }
    temp.track(); // automatically track and cleanup files at exit
    var tempDir = path.join(temp.mkdirSync(TEMP_DIR_NAME), TEMP_DIR_NAME);
    wrench.copyDirSyncRecursive(sourceDir, tempDir, { exclude: EXCLUDED_PATHS });
    process.chdir(tempDir);
    debug('Temp dir: ' + tempDir);
    transformFlowConfig(sourceDir, tempDir);
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
