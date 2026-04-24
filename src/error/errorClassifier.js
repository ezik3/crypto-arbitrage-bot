"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorClassifier = void 0;
class ErrorClassifier {
    classifyError(error) {
        if (error.message.includes('insufficient funds')) {
            return 'FUNDING_ERROR';
        }
        if (error.message.includes('gas')) {
            return 'GAS_ERROR';
        }
        return this.determineErrorType(error);
    }
}
exports.ErrorClassifier = ErrorClassifier;
