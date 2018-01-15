"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const strings_1 = require("../src/languageService/utils/strings");
var assert = require('assert');
suite("String Tests", () => {
    describe('startsWith', function () {
        it('String with different lengths', () => {
            let one = "hello";
            let other = "goodbye";
            var result = strings_1.startsWith(one, other);
            assert.equal(result, false);
        });
        it('String with same length different first letter', () => {
            let one = "hello";
            let other = "jello";
            var result = strings_1.startsWith(one, other);
            assert.equal(result, false);
        });
        it('Same string', () => {
            let one = "hello";
            let other = "hello";
            var result = strings_1.startsWith(one, other);
            assert.equal(result, true);
        });
    });
    describe('endsWith', function () {
        it('String with different lengths', () => {
            let one = "hello";
            let other = "goodbye";
            var result = strings_1.endsWith(one, other);
            assert.equal(result, false);
        });
        it('Strings that are the same', () => {
            let one = "hello";
            let other = "hello";
            var result = strings_1.endsWith(one, other);
            assert.equal(result, true);
        });
        it('Other is smaller then one', () => {
            let one = "hello";
            let other = "hi";
            var result = strings_1.endsWith(one, other);
            assert.equal(result, false);
        });
    });
    describe('convertSimple2RegExpPattern', function () {
        it('Test of convertSimple2RegExpPattern', () => {
            var result = strings_1.convertSimple2RegExpPattern("/*");
            assert.equal(result, "/.*");
        });
    });
});
//# sourceMappingURL=strings.test.js.map