"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathFinder = void 0;
class PathFinder {
    findAllPaths(startToken, endToken, dexes, maxHops) {
        const paths = [];
        this.dfs(startToken, endToken, dexes, [], paths, maxHops);
        return paths;
    }
}
exports.PathFinder = PathFinder;
