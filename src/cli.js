#!/usr/bin/env node

try {
    if (!process.argv[2]) {
        console.log('Usage: flotate [COMMAND]');
    } else if (process.argv[2] === 'check') {
        require(__dirname + '/flotate').flowCheck(process.argv[3] || '.');
    } else {
       throw new Error('Only the "check" command is currently supported; try "flotate check ."');
    }
} catch (e) {
    console.log(e + ''); // print the error
    process.exit(1);
}
