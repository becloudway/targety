export class Promises {
    /** Resolves a promise array sequentially, instead of parallel */
    public static resolvePromiseChain<T>(tasks: any): Array<T> {
        return tasks.reduce(
            (promiseChain: any, currentTask: any) =>
                promiseChain.then((chainResults: any) =>
                    currentTask(chainResults).then((currentResult: any) => [...chainResults, currentResult]),
                ),
            Promise.resolve([]),
        );
    }
}
