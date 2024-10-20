/*
 * node.js
 */

import {randint} from "./random.js"

import * as sym from "./sym.js"

export class Node {
	constructor(person) {
		this.person = person

		this.clear()

		this.parents = []
		this.mates = []
		this.children = []
	}

	clear() {
		this.x = undefined
		this.y = undefined
		this.root_x = undefined
		this.root_y = undefined

		this.hue = undefined

		this.spreaded = false

		this.connections = [false, false, false, false]
	}

	is_hidden() {
		return this.person.hidden
	}

	spread(nodes, view) {
		if (this.spreaded)
			return

		this.place_parents(nodes, view, this)
		this.place_mates(nodes, view)
		this.place_children(nodes, view)

		this.spreaded = true

		for (let i in this.parents)
			this.parents[i].spread(nodes, view)

		for (let i in this.mates)
			this.mates[i].spread(nodes, view)

		for (let i in this.children)
			this.children[i].spread(nodes, view)
	}

	place_parents(nodes, view, base) {
		let crowd = [this]

		for (let i in this.parents) {
			let p = this.parents[i]

			let x = (this.x - base.x) * 2
			let mx = view.fw / 2

			if (p.person.sex == sym.MALE)
				mx = -mx

			p.place(crowd, view, x, mx)

			crowd.push(...p.place_parents(nodes, view, base))
		}

		for (let i = 0; i < nodes.length; i++) {
			let node = nodes[i]
			if (node.is_hidden())
				continue

			for (let k = 0; k < crowd.length; k++) {
				if (node == crowd[k])
					continue

				if (node.hit_test(crowd[k], view)) {
					if (base.x > 0) {
						for (let k in crowd)
							crowd[k].x += view.fw / 2
					} else {
						for (let k in crowd)
							crowd[k].x -= view.fw / 2
					}
					i = -1
					k = -1
				}
			}
		}

		return crowd
	}

	place_mates(nodes, view) {
		let x = this.x + view.w
		let inc = view.w / 4.31
		if (this.person.sex == sym.FEMALE) {
			inc = -inc
			x = this.x - view.w
		}

		for (let i in this.mates)
			this.mates[i].place(nodes, view, x, inc)
	}

	place_children(nodes, view) {
		for (let i in this.children) {
			let mate = this.children[i].get_other_parent(this)

			let x = this.x
			if (mate != undefined)
				x = (this.x + mate.x) / 2

			if (x >= 0)
				x += randint(view.w)
			else
				x -= randint(view.w)

			this.children[i].place(nodes, view, x, 0)
		}
	}

	place(nodes, view, x, mx) {
		if (this.x != undefined)
			return

		this.x = x + mx

		if (mx == 0)
			mx = view.w / 4.13

		for (let i = 0; i < nodes.length; i++) {
			let node = nodes[i]
			if (node.is_hidden() || node == this || node.x == undefined)
				continue

			if (this.hit_test(node, view)) {
				this.x += mx
				i = -1
			}
		}
	}

	get_other_parent(p) {
		for (let i in this.parents)
			if (this.parents[i] != p)
				return this.parents[i]
	}

	get_root(view) {
		if (this.parents.length == 1) {
			this.parents[0].connections[2] = true

			this.root_x = this.parents[0].x
			this.root_y = this.parents[0].y + view.h / 2.4

		} else if (this.parents.length == 2) {
			let mid = this.parents[0].get_middle(this.parents[1], view)

			this.root_x = mid[0]
			this.root_y = mid[1]
		}
	}

	get_middle(node, view) {
		let mx = (this.x + node.x) / 2
		let my = (this.y + node.y) / 2
		if (Math.abs(this.y - node.y) < view.h)
			if (this.y > node.y)
				my = this.y + view.h / 2
			else
				my = node.y + view.h / 2

		return [mx, my]
	}

	hit_test(node, view) {
		if (Math.abs(this.x - node.x) < view.fw &&
			Math.abs(this.y - node.y) < view.fh) {
			return true
		}

		return false
	}
}
