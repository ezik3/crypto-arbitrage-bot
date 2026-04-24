
export class PathFinder {
    findAllPaths(
        startToken: string,
        endToken: string,
        dexes: string[],
        maxHops: number
    ) {
        const paths: any[] = [];
        this.dfs(startToken, endToken, dexes, [], paths, maxHops);
        return paths;
    }

    dfs(current: string, end: string, dexes: string[], path: any[], paths: any[], maxHops: number): void { }
}
