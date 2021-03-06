/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
class YAMLDocumentSymbols {
    findDocumentSymbols(document, doc) {
        if (!doc || doc["documents"].length === 0) {
            return null;
        }
        let collectOutlineEntries = (result, node, containerName) => {
            if (node.type === 'array') {
                node.items.forEach((node) => {
                    collectOutlineEntries(result, node, containerName);
                });
            }
            else if (node.type === 'object') {
                let objectNode = node;
                objectNode.properties.forEach((property) => {
                    let location = vscode_languageserver_types_1.Location.create(document.uri, vscode_languageserver_types_1.Range.create(document.positionAt(property.start), document.positionAt(property.end)));
                    let valueNode = property.value;
                    if (valueNode) {
                        let childContainerName = containerName ? containerName + '.' + property.key.value : property.key.value;
                        result.push({ name: property.key.getValue(), kind: this.getSymbolKind(valueNode.type), location: location, containerName: containerName });
                        collectOutlineEntries(result, valueNode, childContainerName);
                    }
                });
            }
            return result;
        };
        let results = [];
        for (let yamlDoc in doc["documents"]) {
            let currentYAMLDoc = doc["documents"][yamlDoc];
            if (currentYAMLDoc.root) {
                let result = collectOutlineEntries([], currentYAMLDoc.root, void 0);
                results = results.concat(result);
            }
        }
        return results;
    }
    getSymbolKind(nodeType) {
        switch (nodeType) {
            case 'object':
                return vscode_languageserver_types_1.SymbolKind.Module;
            case 'string':
                return vscode_languageserver_types_1.SymbolKind.String;
            case 'number':
                return vscode_languageserver_types_1.SymbolKind.Number;
            case 'array':
                return vscode_languageserver_types_1.SymbolKind.Array;
            case 'boolean':
                return vscode_languageserver_types_1.SymbolKind.Boolean;
            default:
                return vscode_languageserver_types_1.SymbolKind.Variable;
        }
    }
}
exports.YAMLDocumentSymbols = YAMLDocumentSymbols;
//# sourceMappingURL=documentSymbols.js.map