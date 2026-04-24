
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

    determineErrorType(error: Error): any { return 'UNKNOWN_ERROR'; }
}
