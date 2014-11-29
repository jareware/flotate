var esprima = require('esprima-fb');
var falafel = require('falafel');

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
    return flownotateString.replace(/\s*\/\*\s*([a-z]+)\s*\*\/\s*/, ' : $1');
}

function jsToJsx(jsSource) {
    return falafel(jsSource, { parse: jsToAst }, function(node) {
        if (node.type === 'FunctionDeclaration') {
            node.params.forEach(function(paramNode) {
                if (paramNode.trailingComments && paramNode.trailingComments.length === 1) {
                    paramNode.update(paramNode.source() + commentToFlowType(paramNode.trailingComments[0].source()));
                    paramNode.trailingComments[0].update('');
                }
            });
        }
    });
}

exports.jsToJsx = jsToJsx;
