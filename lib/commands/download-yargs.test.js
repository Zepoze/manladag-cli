'use strict';

const test = require('tape');
const spawn = require('tape-spawn')
const opts = {cwd: process.env.PWD}

test('cli ok', t => {
  const proc = spawn(t, 'manladag download -m one-piece -s lelscan -c 900', opts);  // (1)

  proc.exitCode(0);                       // (2)
  proc.stdout.match(/\d+\ downloaded\ !/)
  proc.end();
})

test('cli ok without chapter', t => {
  const proc = spawn(t, 'manladag download -m one-piece -s lelscan', opts);  // (1)

  proc.exitCode(0);                       // (2)
  proc.stdout.match(/\d+\ downloaded\ !/)
  proc.end();
})