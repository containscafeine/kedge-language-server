"use strict";
const jsonSchemaService_1 = require("./services/jsonSchemaService");
const documentSymbols_1 = require("./services/documentSymbols");
const yamlCompletion_1 = require("./services/yamlCompletion");
const yamlHover_1 = require("./services/yamlHover");
const yamlValidation_1 = require("./services/yamlValidation");
function getLanguageService(schemaRequestService, workspaceContext, contributions, promiseConstructor) {
    let promise = promiseConstructor || Promise;
    let schemaService = new jsonSchemaService_1.JSONSchemaService(schemaRequestService, workspaceContext);
    let completer = new yamlCompletion_1.YAMLCompletion(schemaService, contributions, promise);
    let hover = new yamlHover_1.YAMLHover(schemaService, contributions, promise);
    let yamlDocumentSymbols = new documentSymbols_1.YAMLDocumentSymbols();
    let yamlValidation = new yamlValidation_1.YAMLValidation(schemaService, promise);
    return {
        configure: (settings) => {
            schemaService.clearExternalSchemas();
            if (settings.schemas) {
                settings.schemas.forEach(settings => {
                    schemaService.registerExternalSchema(settings.uri, settings.fileMatch, settings.schema);
                });
            }
            yamlValidation.configure(settings);
        },
        doComplete: completer.doComplete.bind(completer),
        doResolve: completer.doResolve.bind(completer),
        doValidation: yamlValidation.doValidation.bind(yamlValidation),
        doHover: hover.doHover.bind(hover),
        findDocumentSymbols: yamlDocumentSymbols.findDocumentSymbols.bind(yamlDocumentSymbols)
    };
}
exports.getLanguageService = getLanguageService;
//# sourceMappingURL=yamlLanguageService.js.map