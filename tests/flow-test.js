'use strict';
var flow = require('../lib/flow');
var chai = require('chai');
var should = require('chai').should();
var expect = require('chai').expect;
var sinon = require('sinon');
var fs = require('fs');
var directory = './cats';

var fun1 = function(next) {
    setTimeout(function() {
        next(null, 'result1');
    }, 500);
};
var funParallel = function(next) {
    setTimeout(function() {
        next(null, 'result2');
    }, 500);
};
var fun2 = function(data, next) {
    setTimeout(function() {
        next(null, 'result2');
    }, 500);
};
var fun3 = function(data, next) {
    setTimeout(function() {
        next(null, 'result3');
    }, 500);
};
var fun4 = function(data, next) {
    setTimeout(function() {
        next(null, 'result4');
    }, 500);
};
var funError = function(data, next) {
    next(true, 'result');
};

var funErrorParallel = function(next) {
    next(true, 'result');
};

var mapFunction = function(value, next) {
    next(null, value * 2);
};
var mapFunctionError = function(value, next) {
    next(true, value * 2);
};

var myCallback = function(error, data) {

};
describe('flow.serial', function () {
    describe('result callback', function() {
        it('should be called once', function() {
            var spy = sinon.spy();
            flow.serial([fun1, fun2], spy);
            spy.should.have.been.calledOnce;
        });

        it('should take 2 arguments', function() {
            var spy = sinon.spy(function(err, data) {
                var resultCallback = spy.getCall(0);
                resultCallback.args.length.should.equal(2);
            });
            flow.serial([fun1, fun2, fun3], spy);
        });
        it('should have data of the last function', function() {
            var spy = sinon.spy(function(error, data) {
                var resultCallback = spy.getCall(0);
                resultCallback.args[1].should.equal('result3');
            });
            flow.serial([fun1, fun2, fun3], spy);
        });
        it('should have error in results callback if error was in functions', function() {
            var spy = sinon.spy(function(err, data){
                var resultCallback = spy.getCall(0);
                resultCallback.args[0].should.be.equal(true);
            });
            flow.serial([fun1, funError], spy);
        });
    });
    it('should send functions data serial', function() {
        var spyFun4 = sinon.spy(function(data, next) {
            var resultCallback = spyFun4.getCall(0);
            resultCallback.args[0].should.equal('result3');
            next(null, 'result4');
        });
        flow.serial([fun1, fun2, fun3, spyFun4], function(err, data) {});
    });
    it('should not call next function after error', function() {
        var spyFun3 = sinon.spy(fun3);
        flow.serial([fun1, fun2, funError, spyFun3], function(err, data) {});
        spyFun3.callCount.should.equal(0);
    });
});

describe('flow.parallel', function () {
    describe('result callback', function() {
        it('should be called once', function() {
            var spy = sinon.spy(function(err, data) {
                spy.should.have.been.calledOnce;
            });
            flow.parallel([fun1, funParallel], spy);
        });

        it('should take 2 arguments', function() {
            var spy = sinon.spy(function(err, data) {
                var resultCallback = spy.getCall(0);
                resultCallback.args.length.should.equal(2);
            });
            flow.parallel([fun1, funParallel], spy);
        });
        it('should have array of results', function() {
            var spy = sinon.spy(function(err, data){
                var resultCallback = spy.getCall(0);
                resultCallback.args[1].should.deep.equal(['result1', 'result2']);
            });
            flow.parallel([fun1, funParallel], spy);
        });
        it('should have error in results callback if error was in functions', function() {
            var spy = sinon.spy(function(err, data){
                var resultCallback = spy.getCall(0);
                resultCallback.args[0].should.be.equal(true);
            });
            flow.parallel([fun1, funErrorParallel], spy);
        });
    });
});

describe('flow.map', function () {
    describe('result callback', function() {
        it('should be called once', function() {
            var spy = sinon.spy(function(err, data) {
                spy.should.have.been.calledOnce;
            });
            flow.map([2, 4], mapFunction, spy);
        });

        it('should take 2 arguments', function() {
            var spy = sinon.spy(function(err, data) {
                var resultCallback = spy.getCall(0);
                resultCallback.args.length.should.equal(2);
            });
            flow.map([2, 4], mapFunction, spy);
        });
        it('should have array of results', function() {
            var spy = sinon.spy(function(err, data){
                var resultCallback = spy.getCall(0);
                resultCallback.args[1].should.deep.equal([4, 8]);
            });
            flow.map([2, 4], mapFunction, spy);
        });
        it('should have error in results callback if error was in function calls', function() {
            var spy = sinon.spy(function(err, data){
                var resultCallback = spy.getCall(0);
                resultCallback.args[0].should.be.equal(true);
            });
            flow.map([2, 4], mapFunctionError, spy);
        });
    });
});

