export {}

declare global {
	interface Array<T> {
		includes(input:unknown):input is T;
	}
	interface ReadonlyArray<T> {
		includes(input:unknown, fromIndex?:number):input is T;
	}
}
