"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_languageserver_1 = require("vscode-languageserver");
const yamlLanguageService_1 = require("../src/languageService/yamlLanguageService");
const jsonSchemaService_1 = require("../src/languageService/services/jsonSchemaService");
const testHelper_1 = require("./testHelper");
const yamlParser_1 = require("../src/languageService/parser/yamlParser");
var assert = require('assert');
let languageService = yamlLanguageService_1.getLanguageService(testHelper_1.schemaRequestService, testHelper_1.workspaceContext, [], null);
let schemaService = new jsonSchemaService_1.JSONSchemaService(testHelper_1.schemaRequestService, testHelper_1.workspaceContext);
let uri = 'http://json.schemastore.org/bowerrc';
let languageSettings = {
    schemas: [],
    validate: true
};
let fileMatch = ["*.yml", "*.yaml"];
languageSettings.schemas.push({ uri, fileMatch: fileMatch });
languageService.configure(languageSettings);
// Defines a Mocha test suite to group tests of similar kind together
suite("Validation Tests", () => {
    // Tests for validator
    describe('Validation', function () {
        function setup(content) {
            return vscode_languageserver_1.TextDocument.create("file://~/Desktop/vscode-k8s/test.yaml", "yaml", 0, content);
        }
        function parseSetup(content) {
            let testTextDocument = setup(content);
            let yDoc = yamlParser_1.parse(testTextDocument.getText());
            return languageService.doValidation(testTextDocument, yDoc, false);
        }
        //Validating basic nodes
        describe('Test that validation does not throw errors', function () {
            it('Basic test', (done) => {
                let content = `analytics: true`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.equal(result.length, 0);
                }).then(done, done);
            });
            it('Basic test on nodes with children', (done) => {
                let content = `scripts:\n  preinstall: test1\n  postinstall: test2`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.equal(result.length, 0);
                }).then(done, done);
            });
            it('Advanced test on nodes with children', (done) => {
                let content = `analytics: true\ncwd: this\nscripts:\n  preinstall: test1\n  postinstall: test2`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.equal(result.length, 0);
                }).then(done, done);
            });
            it('Type string validates under children', (done) => {
                let content = `registry:\n  register: test_url`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.equal(result.length, 0);
                }).then(done, done);
            });
            describe('Type tests', function () {
                it('Type String does not error on valid node', (done) => {
                    let content = `cwd: this`;
                    let validator = parseSetup(content);
                    validator.then(function (result) {
                        assert.equal(result.length, 0);
                    }).then(done, done);
                });
                it('Type Boolean does not error on valid node', (done) => {
                    let content = `analytics: true`;
                    let validator = parseSetup(content);
                    validator.then(function (result) {
                        assert.equal(result.length, 0);
                    }).then(done, done);
                });
                it('Type Number does not error on valid node', (done) => {
                    let content = `timeout: 60000`;
                    let validator = parseSetup(content);
                    validator.then(function (result) {
                        assert.equal(result.length, 0);
                    }).then(done, done);
                });
                it('Type Object does not error on valid node', (done) => {
                    let content = `registry:\n  search: test_url`;
                    let validator = parseSetup(content);
                    validator.then(function (result) {
                        assert.equal(result.length, 0);
                    }).then(done, done);
                });
                it('Type Array does not error on valid node', (done) => {
                    let content = `resolvers:\n  - test\n  - test\n  - test`;
                    let validator = parseSetup(content);
                    validator.then(function (result) {
                        assert.equal(result.length, 0);
                    }).then(done, done);
                });
                it('Do not error when there are multiple types in schema and theyre valid', (done) => {
                    let content = `license: MIT`;
                    let validator = parseSetup(content);
                    validator.then(function (result) {
                        assert.equal(result.length, 0);
                    });
                    let content2 = `license: MIT`;
                    let validator2 = parseSetup(content);
                    validator2.then(function (result) {
                        assert.equal(result.length, 0);
                    });
                    done();
                });
            });
        });
        describe('Test that validation DOES throw errors', function () {
            it('Error when theres a finished untyped item', (done) => {
                let content = `cwd: hello\nan`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
            it('Error when theres no value for a node', (done) => {
                let content = `cwd:`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
            it('Error on incorrect value type (number)', (done) => {
                let content = `cwd: 100000`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
            it('Error on incorrect value type (boolean)', (done) => {
                let content = `cwd: False`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
            it('Error on incorrect value type (string)', (done) => {
                let content = `analytics: hello`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
            it('Error on incorrect value type (object)', (done) => {
                let content = `scripts: test`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
            it('Error on incorrect value type (array)', (done) => {
                let content = `resolvers: test`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
        });
    });
});
//# sourceMappingURL=schemaValidation.test.js.map