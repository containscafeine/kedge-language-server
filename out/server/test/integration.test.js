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
const arrUtils_1 = require("../src/languageService/utils/arrUtils");
var assert = require('assert');
let languageService = yamlLanguageService_1.getLanguageService(testHelper_1.schemaRequestService, testHelper_1.workspaceContext, [], null);
let schemaService = new jsonSchemaService_1.JSONSchemaService(testHelper_1.schemaRequestService, testHelper_1.workspaceContext);
let uri = "http://central.maven.org/maven2/io/fabric8/kubernetes-model/2.0.0/kubernetes-model-2.0.0-schema.json";
let languageSettings = {
    schemas: [],
    validate: true
};
let fileMatch = ["*.yml", "*.yaml"];
languageSettings.schemas.push({ uri, fileMatch: fileMatch });
languageService.configure(languageSettings);
// Defines a Mocha test suite to group tests of similar kind together
suite("Kubernetes Integration Tests", () => {
    // Tests for validator
    describe('Yaml Validation with kubernetes', function () {
        function setup(content) {
            return vscode_languageserver_1.TextDocument.create("file://~/Desktop/vscode-k8s/test.yaml", "yaml", 0, content);
        }
        function parseSetup(content) {
            let testTextDocument = setup(content);
            let yDoc = yamlParser_1.parse(testTextDocument.getText());
            return languageService.doValidation(testTextDocument, yDoc, true);
        }
        //Validating basic nodes
        describe('Test that validation does not throw errors', function () {
            it('Basic test', (done) => {
                let content = `apiVersion: v1`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.equal(result.length, 0);
                }).then(done, done);
            });
            it('Basic test on nodes with children', (done) => {
                let content = `metadata:\n  name: hello`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.equal(result.length, 0);
                }).then(done, done);
            });
            it('Advanced test on nodes with children', (done) => {
                let content = `apiVersion: v1\nmetadata:\n  name: test1`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.equal(result.length, 0);
                }).then(done, done);
            });
            it('Type string validates under children', (done) => {
                let content = `metadata:\n  resourceVersion: test`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.equal(result.length, 0);
                }).then(done, done);
            });
            describe('Type tests', function () {
                it('Type String does not error on valid node', (done) => {
                    let content = `apiVersion: v1`;
                    let validator = parseSetup(content);
                    validator.then(function (result) {
                        assert.equal(result.length, 0);
                    }).then(done, done);
                });
                it('Type Boolean does not error on valid node', (done) => {
                    let content = `isNonResourceURL: false`;
                    let validator = parseSetup(content);
                    validator.then(function (result) {
                        assert.equal(result.length, 0);
                    }).then(done, done);
                });
                it('Type Number does not error on valid node', (done) => {
                    let content = `generation: 5`;
                    let validator = parseSetup(content);
                    validator.then(function (result) {
                        assert.equal(result.length, 0);
                    }).then(done, done);
                });
                it('Type Object does not error on valid node', (done) => {
                    let content = `metadata:\n  clusterName: tes`;
                    let validator = parseSetup(content);
                    validator.then(function (result) {
                        assert.equal(result.length, 0);
                    }).then(done, done);
                });
                it('Type Array does not error on valid node', (done) => {
                    let content = `items:\n  - test: test`;
                    let validator = parseSetup(content);
                    validator.then(function (result) {
                        assert.equal(result.length, 0);
                    }).then(done, done);
                });
            });
        });
        describe('Test that validation DOES throw errors', function () {
            it('Error when theres a finished untyped item', (done) => {
                let content = `api`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
            it('Error when theres no value for a node', (done) => {
                let content = `apiVersion:`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
            it('Error on incorrect value type (number)', (done) => {
                let content = `apiVersion: 1000`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
            it('Error on incorrect value type (boolean)', (done) => {
                let content = `apiVersion: False`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
            it('Error on incorrect value type (string)', (done) => {
                let content = `isNonResourceURL: hello_world`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
            it('Error on incorrect value type (object)', (done) => {
                let content = `metadata: hello`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
            it('Error on incorrect value type in multiple yaml documents', (done) => {
                let content = `---\napiVersion: v1\n...\n---\napiVersion: False\n...`;
                let validator = parseSetup(content);
                validator.then(function (result) {
                    assert.notEqual(result.length, 0);
                }).then(done, done);
            });
        });
    });
    describe('yamlCompletion with kubernetes', function () {
        describe('doComplete', function () {
            function setup(content) {
                return vscode_languageserver_1.TextDocument.create("file://~/Desktop/vscode-k8s/test.yaml", "yaml", 0, content);
            }
            function parseSetup(content, position) {
                let testTextDocument = setup(content);
                let yDoc = yamlParser_1.parse(testTextDocument.getText());
                return completionHelper(testTextDocument, testTextDocument.positionAt(position), false);
            }
            it('Autocomplete on root node without word', (done) => {
                let content = "";
                let completion = parseSetup(content, 0);
                completion.then(function (result) {
                    assert.notEqual(result.items.length, 0);
                }).then(done, done);
            });
            it('Autocomplete on root node with word', (done) => {
                let content = "api";
                let completion = parseSetup(content, 6);
                completion.then(function (result) {
                    assert.notEqual(result.items.length, 0);
                }).then(done, done);
            });
            it('Autocomplete on default value (without value content)', (done) => {
                let content = "apiVersion: ";
                let completion = parseSetup(content, 12);
                completion.then(function (result) {
                    assert.notEqual(result.items.length, 0);
                }).then(done, done);
            });
            it('Autocomplete on default value (with value content)', (done) => {
                let content = "apiVersion: apps";
                let completion = parseSetup(content, 15);
                completion.then(function (result) {
                    assert.notEqual(result.items.length, 0);
                }).then(done, done);
            });
            it('Autocomplete on boolean value (without value content)', (done) => {
                let content = "isNonResourceURL: ";
                let completion = parseSetup(content, 18);
                completion.then(function (result) {
                    assert.equal(result.items.length, 2);
                }).then(done, done);
            });
            it('Autocomplete on boolean value (with value content)', (done) => {
                let content = "isNonResourceURL: fal";
                let completion = parseSetup(content, 21);
                completion.then(function (result) {
                    assert.equal(result.items.length, 2);
                }).then(done, done);
            });
            it('Autocomplete key in middle of file', (done) => {
                let content = "metadata:\n  nam";
                let completion = parseSetup(content, 14);
                completion.then(function (result) {
                    assert.notEqual(result.items.length, 0);
                }).then(done, done);
            });
            it('Autocomplete key in middle of file 2', (done) => {
                let content = "metadata:\n  name: test\n  cluster";
                let completion = parseSetup(content, 31);
                completion.then(function (result) {
                    assert.notEqual(result.items.length, 0);
                }).then(done, done);
            });
        });
    });
});
function completionHelper(document, textDocumentPosition, isKubernetes) {
    //Get the string we are looking at via a substring
    let linePos = textDocumentPosition.line;
    let position = textDocumentPosition;
    let lineOffset = arrUtils_1.getLineOffsets(document.getText());
    let start = lineOffset[linePos]; //Start of where the autocompletion is happening
    let end = 0; //End of where the autocompletion is happening
    if (lineOffset[linePos + 1]) {
        end = lineOffset[linePos + 1];
    }
    else {
        end = document.getText().length;
    }
    let textLine = document.getText().substring(start, end);
    //Check if the string we are looking at is a node
    if (textLine.indexOf(":") === -1) {
        //We need to add the ":" to load the nodes
        let newText = "";
        //This is for the empty line case
        let trimmedText = textLine.trim();
        if (trimmedText.length === 0 || (trimmedText.length === 1 && trimmedText[0] === '-')) {
            //Add a temp node that is in the document but we don't use at all.
            if (lineOffset[linePos + 1]) {
                newText = document.getText().substring(0, start + (textLine.length - 1)) + "holder:\r\n" + document.getText().substr(end + 2);
            }
            else {
                newText = document.getText().substring(0, start + (textLine.length)) + "holder:\r\n" + document.getText().substr(end + 2);
            }
        }
        else {
            //Add a semicolon to the end of the current line so we can validate the node
            if (lineOffset[linePos + 1]) {
                newText = document.getText().substring(0, start + (textLine.length - 1)) + ":\r\n" + document.getText().substr(end + 2);
            }
            else {
                newText = document.getText().substring(0, start + (textLine.length)) + ":\r\n" + document.getText().substr(end + 2);
            }
        }
        let jsonDocument = yamlParser_1.parse(newText);
        return languageService.doComplete(document, position, jsonDocument, isKubernetes);
    }
    else {
        //All the nodes are loaded
        position.character = position.character - 1;
        let jsonDocument = yamlParser_1.parse(document.getText());
        return languageService.doComplete(document, position, jsonDocument, isKubernetes);
    }
}
//# sourceMappingURL=integration.test.js.map