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
    schemas: []
};
let fileMatch = ["*.yml", "*.yaml"];
languageSettings.schemas.push({ uri, fileMatch: fileMatch });
languageService.configure(languageSettings);
suite("Hover Tests", () => {
    describe('Yaml Hover with bowerrc', function () {
        describe('doComplete', function () {
            function setup(content) {
                return vscode_languageserver_1.TextDocument.create("file://~/Desktop/vscode-k8s/test.yaml", "yaml", 0, content);
            }
            function parseSetup(content, position) {
                let testTextDocument = setup(content);
                let jsonDocument = yamlParser_1.parse(testTextDocument.getText());
                return languageService.doHover(testTextDocument, testTextDocument.positionAt(position), jsonDocument, false);
            }
            it('Hover on key on root', (done) => {
                let content = "cwd: test";
                let hover = parseSetup(content, 1);
                hover.then(function (result) {
                    assert.notEqual(result.contents.length, 0);
                }).then(done, done);
            });
            it('Hover on value on root', (done) => {
                let content = "cwd: test";
                let hover = parseSetup(content, 6);
                hover.then(function (result) {
                    assert.notEqual(result.contents.length, 0);
                }).then(done, done);
            });
            it('Hover on key with depth', (done) => {
                let content = "scripts:\n  postinstall: test";
                let hover = parseSetup(content, 15);
                hover.then(function (result) {
                    assert.notEqual(result.contents.length, 0);
                }).then(done, done);
            });
            it('Hover on value with depth', (done) => {
                let content = "scripts:\n  postinstall: test";
                let hover = parseSetup(content, 26);
                hover.then(function (result) {
                    assert.notEqual(result.contents.length, 0);
                }).then(done, done);
            });
            it('Hover works on both root node and child nodes works', (done) => {
                let content = "scripts:\n  postinstall: test";
                let firstHover = parseSetup(content, 3);
                firstHover.then(function (result) {
                    assert.notEqual(result.contents.length, 0);
                });
                let secondHover = parseSetup(content, 15);
                secondHover.then(function (result) {
                    assert.notEqual(result.contents.length, 0);
                }).then(done, done);
            });
            it('Hover does not show results when there isnt description field', (done) => {
                let content = "analytics: true";
                let hover = parseSetup(content, 3);
                hover.then(function (result) {
                    assert.notEqual(result.contents.length, 0);
                }).then(done, done);
            });
            it('Hover on multi document', (done) => {
                let content = '---\nanalytics: true\n...\n---\njson: test\n...';
                let hover = parseSetup(content, 30);
                hover.then(function (result) {
                    assert.notEqual(result.contents.length, 0);
                }).then(done, done);
            });
        });
    });
});
//# sourceMappingURL=hover.test.js.map