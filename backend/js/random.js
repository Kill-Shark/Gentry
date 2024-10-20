/*
 * random.js
 */

let seed = 0

export function randint(max) {
	seed = Math.abs((seed * 1777771 + 777977) & 0xffffffffffff)
	return seed % max
}

export function rand_seed_set(s) {
	seed = s
}

export function rand() {
	return randint(0xffffffff) / 0xffffffff
}
