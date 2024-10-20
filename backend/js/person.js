/*
 * person.js
 */

import {GtDate} from "./gtdate.js"

import * as sym from "./sym.js"

export class Person {
	constructor(id, num) {
		this.id = id
		this.num = num

		this.subj = []
		this.part = []

		this.parents = []
		this.mates = []
		this.children = []

		this.hidden = false

		this.clear()
	}

	add_event_raw(e) {
		if (sym.SUBJECT in e && e[sym.SUBJECT].id == this.id) {
			this.subj.push(e)
		} else {
			this.part.push(e)
		}
	}

	add_event(e) {
		this.add_event_raw(e)
		this.update()
	}

	clear() {
		this.name_birth = undefined
		this.name_actual = undefined
		this.sex = undefined
		this.birth = undefined
		this.death = undefined
	}

	get_real_y() {
		if (this.birth != undefined)
			return this.birth.year

		if (this.y != undefined)
			return this.y

		return undefined
	}

	get_y_from_children() {
		let high = 9999

		let y = 0
		let c = 0
		for (let i in this.children) {
			let cy = this.children[i].get_real_y()
			if (cy == undefined) {
				cy = this.children[i].get_y_from_children()
				if (cy == undefined)
					continue
			}
			y += cy - 20
			c += 1

			if (cy - 15 < high)
				high = cy - 15
		}

		if (c == 0)
			return undefined

		y = y / c

		if (high != 9999 && y > high)
			y = high

		return Math.round(y)
	}

	get_y_from_parents() {
		let low = 0

		let y = 0
		let c = 0
		for (let i in this.parents) {
			let py = this.parents[i].get_real_y()
			if (py == undefined) {
				py = this.parents[i].get_y_from_parents()
				if (py == undefined)
					continue
			}
			y += py + 20
			c += 1

			if (py + 15 > low)
				low = py + 15
		}

		if (c == 0)
			return undefined

		y = y / c

		if (low != 0 && y < low)
			y = low

		return Math.round(y)
	}

	get_y() {
		let y = this.get_real_y()
		if (y != undefined)
			return y

		this.y = this.get_y_from_children()
		y = this.get_y_from_parents()

		if (this.y == undefined) {
			if (y == undefined) {
				y = 0
				let c = 0
				for (let i in this.mates) {
					let my = this.mates[i].get_y()
					if (my == undefined)
						continue

					y += my
					c += 1
				}
				if (c == 0)
					console.log("Total failure", this)

				this.y = Math.round(y / c)

			} else {
				this.y = y
			}
		} else if (y != undefined) {
			this.y = Math.round((this.y + y) / 2)
		}

		return this.y
	}

	update() {
		let name_date = new GtDate("0")

		this.title = undefined

		for (let i = 0; i < this.subj.length; i++) {
			let e = this.subj[i]
			switch (e[sym.TYPE]) {
			case sym.BIRTH:
				if (sym.NAME in e) {
					this.name_birth = e[sym.NAME]
					this.name_actual = name_override(this.name_birth, this.name_actual)
				}
				if (sym.DATE in e)
					this.birth = e[sym.DATE]

				if (sym.SEX in e)
					this.sex = e[sym.SEX]

				if (sym.FATHER in e)
					this.parents.push(e[sym.FATHER])

				if (sym.MOTHER in e)
					this.parents.push(e[sym.MOTHER])
				break

			case sym.DEATH:
				if (sym.DATE in e) {
					this.death = e[sym.DATE]
				}
				break

			case sym.DATA:
				if (sym.DATE in e) {
					let d = e[sym.DATE]
					if (d.cmp(name_date) > 0) {
						if (sym.NAME in e)
							this.name_actual = name_override(this.name_actual, e[sym.NAME])
						name_date = d
					}
				} else {
					if (sym.NAME in e)
						this.name_actual = name_override(this.name_actual, e[sym.NAME])
				}
				break
			}
		}

		for (let i = 0; i < this.part.length; i++) {
			let e = this.part[i]
			let sym_spouse = sym.WIFE
			let sym_parent = sym.MOTHER
			if (this.sex == sym.FEMALE) {
				sym_spouse = sym.HUSBAND
				sym_parent = sym.FATHER
			}

			switch (e[sym.TYPE]) {
			case sym.BIRTH:
				if (sym_parent in e && this.mates.indexOf(e[sym_parent]) < 0) {
					this.mates.push(e[sym_parent])
				}
				this.children.push(e[sym.SUBJECT])
				break

			case sym.MARRIAGE:
				if (sym_spouse in e && this.mates.indexOf(e[sym_parent]) < 0)
					this.mates.push(e[sym_spouse])
				break
			}
		}

		for (let te in this.tar) {
			let name = this.tar[te].name.split('/').pop()
			name = name.split('.')[0]

			if (name != this.id)
				continue

			this.title = this.tar[te].name
			let ext = this.title.split('.').pop()
			let img = new Image()

			let data = this.tar[te].data
			if (data != undefined) {
				let len = data.length
				let bin = [len]
				while (len--)
					bin[len] = String.fromCharCode(data[len])

				data = bin.join('')
				data = window.btoa(data)

				img.src = "data:image/" + ext + ";base64," + data;
				this.title = img

				img.onload = function() {
					this.title_ratio = img.width / img.height
				}
			}
		}
	}
}

function name_override(a, b) {
	if (b == undefined) {
		b = a
		a = {}
	}

	if (a == undefined)
		a = {}

	let name = a

	if (b[sym.FIRST] != undefined)
		name[sym.FIRST] = b[sym.FIRST]

	if (b[sym.LAST] != undefined)
		name[sym.LAST] = b[sym.LAST]

	if (b[sym.PATRONYM] != undefined)
		name[sym.PATRONYM] = b[sym.PATRONYM]

	if (b[sym.NICKNAME] != undefined)
		name[sym.NICKNAME] = b[sym.NICKNAME]

	return name
}
