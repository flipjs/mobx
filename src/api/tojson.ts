import {ObservableArray} from "../types/observablearray";
import {ObservableMap} from "../types/observablemap";
import {ObservableValue} from "../types/observablevalue";
import {isObservable} from "../api/isobservable";
import {isPlainObject, deprecated} from "../utils/utils";

/**
	* Basically, a deep clone, so that no reactive property will exist anymore.
	*/
export function toJS(source, detectCycles: boolean = true, __alreadySeen: [any, any][] = null) {
	// optimization: using ES6 map would be more efficient!
	function cache(value) {
		if (detectCycles)
			__alreadySeen.push([source, value]);
		return value;
	}

	if (detectCycles && __alreadySeen === null)
		__alreadySeen = [];
	if (detectCycles && source !== null && typeof source === "object") {
		for (let i = 0, l = __alreadySeen.length; i < l; i++)
			if (__alreadySeen[i][0] === source)
				return __alreadySeen[i][1];
	}

	if (!source)
		return source;
	if (Array.isArray(source) || source instanceof ObservableArray) {
		const res = cache([]);
		const toAdd = source.map(value => toJS(value, detectCycles, __alreadySeen));
		res.length = toAdd.length;
		for (let i = 0, l = toAdd.length; i < l; i++)
			res[i] = toAdd[i];
		return res;
	}
	if (source instanceof ObservableMap) {
		const res = cache({});
		source.forEach(
			(value, key) => res[key] = toJS(value, detectCycles, __alreadySeen)
		);
		return res;
	}
	if (typeof source === "object" && isPlainObject(source)) {
		const res = cache({});
		for (let key in source) if (source.hasOwnProperty(key))
			res[key] = toJS(source[key], detectCycles, __alreadySeen);
		return res;
	}
	if (isObservable(source) && source.$mobx instanceof ObservableValue)
		return toJS(source(), detectCycles, __alreadySeen);
	return source;
}

export function toJSON(source, detectCycles: boolean = true, __alreadySeen: [any, any][] = null) {
	deprecated("toJSON is deprecated. Use toJS instead");
	return toJS.apply(null, arguments);
}