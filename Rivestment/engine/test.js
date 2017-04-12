const expect = require('chai').expect;
const engine = require('./index');

describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            expect(-1).to.eql([1,2,3].indexOf(4));
        });
    });
});

