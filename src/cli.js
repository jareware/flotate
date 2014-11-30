#!/usr/bin/env node

require(__dirname + '/flownotate').flowCheck(process.argv[2] || '.');
