
export class MultiPathExecutor {
    async splitAndExecute(
        route: any,
        amount: string,
        maxSplits: number = 3
    ) {
        const optimalSplits = this.calculateOptimalSplits(amount, maxSplits);
        const executions = optimalSplits.map(split => 
            this.executePathWithAmount(route, split)
        );
        
        return Promise.all(executions);
    }
}
