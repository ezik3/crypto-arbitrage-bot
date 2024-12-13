
export class ErrorClassifier {
    classifyError(error: Error) {
        if (error.message.includes('insufficient funds')) {
            return 'FUNDING_ERROR';
        }
        if (error.message.includes('gas')) {
            return 'GAS_ERROR';
        }
        return this.determineErrorType(error);
    }
}
