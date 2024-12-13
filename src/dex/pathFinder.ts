
export class PathFinder {
    findAllPaths(
        startToken: string,
        endToken: string,
        dexes: string[],
        maxHops: number
    ) {
        const paths = []
        this.dfs(startToken, endToken, dexes, [], paths, maxHops)
        return paths
    }
}
