'use strict';
var flow = require('../lib/flow');
var chai = require('chai');
var should = require('chai').should();
var expect = require('chai').expect;
var sinon = require('sinon');
var fs = require('fs');
var directory = './cats';

var fun1 = function(next) {
    next(null, 'result1');
};
var funParallel = function(next) {
    next(null, 'result2');
};
var fun2 = function(data, next) {
    next(null, 'result2');
};
var fun3 = function(data, next) {
    next(null, 'result3');
};
var fun4 = function(data, next) {
    next(null, 'result4');
};
var funError = function(data, next) {
    next(true, 'result');
};
var mapFunction = function(value, next) {
    next(null, value * 2);
};

describe('flow.serial', function () {
    describe('result callback', function() {
        it('should be called once', function() {
            var spy = sinon.spy();
            flow.serial([fun1, fun2], spy);
            expect(spy.calledOnce).to.be.true;
        });

        it('should take 2 arguments', function() {
            var spy = sinon.spy();
            flow.serial([fun1, fun2, fun3], spy);
            var resultCallback = spy.getCall(0);
            resultCallback.args.length.should.equal(2);
        });
        it('should have data of the last function', function() {
            var spy = sinon.spy();
            flow.serial([fun1, fun2, fun3], spy);
            var resultCallback = spy.getCall(0);
            resultCallback.args[1].should.equal('result3');
        });
    });
    it('should send functions data serial', function() {
        var spyFun4 = sinon.spy(fun4);
        var spy = sinon.spy();
        flow.serial([fun1, fun2, fun3, spyFun4], function(err, data) {});
        var resultCallback = spyFun4.getCall(0);
        resultCallback.args[0].should.equal('result3');
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
                expect(spy.calledOnce).to.be.true;
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
    });
});

describe('flow.map', function () {
    describe('result callback', function() {
        it('should be called once', function() {
            var spy = sinon.spy(function(err, data) {
                expect(spy.calledOnce).to.be.true;
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
    });
});

