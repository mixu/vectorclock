var assert = require('assert'),
    vclock = require('../index.js');

exports['given two clocks'] = {

  beforeEach: function() {
    this.a = { clock: {}};
    this.b = { clock: {}};
  },

  'at the same node': {
    'an empty vector clock should be identical to another empty vector clock': function() {
      assert.equal( vclock.compare(this.a, this.b), vclock.CONCURRENT);
      assert.equal( vclock.compare(this.b, this.a), vclock.CONCURRENT);
      assert.equal( vclock.isIdentical(this.a, this.b), true);
    },

    'a clock incremented once should be greater than 0': function(){
      vclock.increment(this.a, 'node-1');
      assert.equal( vclock.compare(this.a, this.b), vclock.GT);
      assert.equal( vclock.compare(this.b, this.a), vclock.LT);
      assert.ok( !vclock.isIdentical(this.a, this.b));
    },

    'a clock incremented twice should be greater than 1': function() {
      vclock.increment(this.a, 'node-1');
      vclock.increment(this.a, 'node-1');
      vclock.increment(this.b, 'node-1');
      assert.equal( vclock.compare(this.a, this.b), vclock.GT);
      assert.equal( vclock.compare(this.b, this.a), vclock.LT);
      assert.ok( !vclock.isIdentical(this.a, this.b));
    },

    'two clocks with the same history should be equal and concurrent': function() {
      vclock.increment(this.a, 'node-1');
      vclock.increment(this.b, 'node-1');
      assert.equal( vclock.compare(this.a, this.b), vclock.CONCURRENT);
      assert.equal( vclock.compare(this.b, this.a), vclock.CONCURRENT);
      assert.ok( vclock.isIdentical(this.a, this.b));
    }
  },

  'at different nodes': {

    beforeEach: function() {
      vclock.increment(this.a, 'node-1');
      vclock.increment(this.b, 'node-1');
      vclock.increment(this.a, 'node-1');
      vclock.increment(this.b, 'node-2');
    },

    'clocks incremented at different nodes should be concurrent but not equal': function() {
      assert.equal( vclock.compare(this.a, this.b), vclock.CONCURRENT);
      assert.equal( vclock.compare(this.b, this.a), vclock.CONCURRENT);
      assert.ok( !vclock.isIdentical(this.a, this.b));
      vclock.increment(this.a, 'node-1');
      assert.equal( vclock.compare(this.a, this.b), vclock.CONCURRENT);
      assert.ok( !vclock.isIdentical(this.a, this.b));
      vclock.increment(this.b, 'node-2');
      vclock.increment(this.b, 'node-2');
      vclock.increment(this.b, 'node-2');
      assert.equal( vclock.compare(this.a, this.b), vclock.CONCURRENT);
      assert.ok( !vclock.isIdentical(this.a, this.b));
    },

    'a merged clock should be greater than either of the clocks': function() {
      var newClock = vclock.merge(this.a, this.b);
      assert.equal( vclock.compare(newClock, this.b), vclock.GT);
      assert.equal( vclock.compare(newClock, this.a), vclock.GT);

    }

  }

};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
