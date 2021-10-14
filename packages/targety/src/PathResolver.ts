import { HttpMethod } from "./common/types";
import { LOGGER } from "./logging";
import { Request } from "./handlers/request/Request";
import { Route } from "./handlers/request/Route";
import { Strings } from "./utils";

const pathParamRegexp = /[\w-]+/;
const pathParamSelectorRegexp = /{.*}/;

interface PathMatcher {
    path: string;
    regexs: RegExp[];
    pathParamIndices: number[];
}

export class PathResolver {
    public paths: PathMatcher[];
    public constructor(private routes: Route[]) {
        this.paths = this.createPaths(routes);
    }

    public routeFinder(method: HttpMethod, resource: string): Route {
        return this.routes.find(
            (v) =>
                Strings.equalsTrimmedCaseInsensitive(v.method, method) &&
                Strings.equalsTrimmedCaseInsensitive(v.path, resource),
        );
    }

    public routeByPathFinder(resource: string): Route[] {
        return this.routes.filter((v) => Strings.equalsTrimmedCaseInsensitive(v.path, resource));
    }

    /**
     * Finds a known path that matches with the request path
     *
     * @param request
     */
    public getFuzzyResource(request: Request): { finalResource: string; isProxyPath: boolean; matcher?: PathMatcher } {
        const resource: string = request.getResource();
        const path: string = request.getPath();

        LOGGER.debug("Looking for resource %s for path %s", resource, path);
        const isProxyPath = this.isProxyPathRequest(resource);

        const finalResource = isProxyPath ? this.getResourceFromPath(path) : undefined;

        return {
            finalResource: (finalResource as PathMatcher)?.path || resource,
            isProxyPath,
            matcher: finalResource,
        };
    }

    public isProxyPathRequest(path: string) {
        return path.split("/").includes("{proxy+}");
    }

    public getResourceFromPath(path: string): PathMatcher {
        const parts = this.safeSplitPath(path);
        const matchedPath = this.paths.find(
            (p) =>
                parts.length === p.regexs.length &&
                p.regexs.every((v, i) => {
                    return v.test(parts[i]);
                }),
        );

        LOGGER.debug("Found resource %s for proxy path %s", matchedPath?.path, path);

        return matchedPath;
    }

    public resolvePathParams(path: string, matcher: PathMatcher): Record<string, any> {
        const pathSplit = path.split("/");
        const resourceSplit = matcher.path.split("/");
        const indices = matcher.pathParamIndices;

        const pathParams = {};
        indices.forEach((v) => {
            const value = pathSplit[v];
            const key = resourceSplit[v];

            const cleanKey = key.replace(/[{}]/g, "");
            pathParams[cleanKey] = value;
        });

        LOGGER.debug("resolved path params: %j", pathParams);

        return pathParams;
    }

    private createPaths(routes: Route[]): PathMatcher[] {
        return routes.map((v: Route) => {
            const pathParamIndices = [];
            const regexs = this.safeSplitPath(v.path).map((p: string, i: number) => {
                const isPathParam = pathParamSelectorRegexp.test(p);
                if (isPathParam) {
                    pathParamIndices.push(i);
                    return pathParamRegexp;
                }
                return new RegExp(p);
            });

            return {
                path: v.path,
                regexs,
                pathParamIndices,
            };
        });
    }

    private safeSplitPath(path: string): string[] {
        return (path === "/" ? "" : path).split("/");
    }
}
