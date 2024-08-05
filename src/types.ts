export { }

declare global {
	interface Array<T> {
		includes(input: unknown): input is T;
	}
	interface ReadonlyArray<T> {
		includes(input: unknown, fromIndex?: number): input is T;
		map<TThis extends ReadonlyArray<T>, U>(this: TThis, callbackfn: (value: T, index: number, array: TThis) => U, thisArg?: any): number extends TThis["length"] ? readonly U[] : { [K in keyof TThis]: U };
	}
}
