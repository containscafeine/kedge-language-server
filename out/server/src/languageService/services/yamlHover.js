/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const kubernetesTransformer_1 = require("../kubernetesTransformer");
const arrUtils_1 = require("../utils/arrUtils");
class YAMLHover {
    constructor(schemaService, contributions = [], promiseConstructor) {
        this.schemaService = schemaService;
        this.contributions = contributions;
        this.promise = promiseConstructor || Promise;
    }
    doHover(document, position, doc, isKubernetes) {
        let offset = document.offsetAt(position);
        let currentDoc = arrUtils_1.matchOffsetToDocument(offset, doc);
        if (currentDoc === null) {
            return null;
        }
        let node = currentDoc.getNodeFromOffset(offset);
        if (!node || (node.type === 'object' || node.type === 'array') && offset > node.start + 1 && offset < node.end - 1) {
            return this.promise.resolve(void 0);
        }
        let hoverRangeNode = node;
        // use the property description when hovering over an object key
        if (node.type === 'string') {
            let stringNode = node;
            if (stringNode.isKey) {
                let propertyNode = node.parent;
                node = propertyNode.value;
                if (!node) {
                    return this.promise.resolve(void 0);
                }
            }
        }
        let hoverRange = vscode_languageserver_types_1.Range.create(document.positionAt(hoverRangeNode.start), document.positionAt(hoverRangeNode.end));
        var createHover = (contents) => {
            let result = {
                contents: contents,
                range: hoverRange
            };
            return result;
        };
        let location = node.getPath();
        for (let i = this.contributions.length - 1; i >= 0; i--) {
            let contribution = this.contributions[i];
            let promise = contribution.getInfoContribution(document.uri, location);
            if (promise) {
                return promise.then(htmlContent => createHover(htmlContent));
            }
        }
        return this.schemaService.getSchemaForResource(document.uri).then((schema) => {
            if (schema) {
                if (isKubernetes) {
                    schema.schema = kubernetesTransformer_1.KubernetesTransformer.doTransformation(schema.schema);
                }
                let matchingSchemas = currentDoc.getMatchingSchemas(schema.schema, node.start);
                let title = null;
                let markdownDescription = null;
                let markdownEnumValueDescription = null, enumValue = null;
                ;
                matchingSchemas.every((s) => {
                    if (s.node === node && !s.inverted && s.schema) {
                        title = title || s.schema.title;
                        markdownDescription = markdownDescription || s.schema["markdownDescription"] || toMarkdown(s.schema.description);
                        if (s.schema.enum) {
                            let idx = s.schema.enum.indexOf(node.getValue());
                            if (s.schema["markdownEnumDescriptions"]) {
                                markdownEnumValueDescription = s.schema["markdownEnumDescriptions"][idx];
                            }
                            else if (s.schema.enumDescriptions) {
                                markdownEnumValueDescription = toMarkdown(s.schema.enumDescriptions[idx]);
                            }
                            if (markdownEnumValueDescription) {
                                enumValue = s.schema.enum[idx];
                                if (typeof enumValue !== 'string') {
                                    enumValue = JSON.stringify(enumValue);
                                }
                            }
                        }
                    }
                    return true;
                });
                let result = '';
                if (title) {
                    result = toMarkdown(title);
                }
                if (markdownDescription) {
                    if (result.length > 0) {
                        result += "\n\n";
                    }
                    result += markdownDescription;
                }
                if (markdownEnumValueDescription) {
                    if (result.length > 0) {
                        result += "\n\n";
                    }
                    result += `\`${toMarkdown(enumValue)}\`: ${markdownEnumValueDescription}`;
                }
                return createHover([result]);
            }
            return void 0;
        });
    }
}
exports.YAMLHover = YAMLHover;
function toMarkdown(plain) {
    if (plain) {
        let res = plain.replace(/([^\n\r])(\r?\n)([^\n\r])/gm, '$1\n\n$3'); // single new lines to \n\n (Markdown paragraph)
        return res.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&"); // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
    }
    return void 0;
}
//# sourceMappingURL=yamlHover.js.map