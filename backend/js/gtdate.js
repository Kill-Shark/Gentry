/*
 * gtdate.js
 */

import * as sym from "./sym.js"

export class GtDate {
	constructor(s) {
		this.approx = false
		if (s[0] == sym.APPROX) {
			this.approx = true
			s = s.slice(1)
		}

		if (s.length != 0) {
			let d = s.split("-")
			switch (d.length) {
			case 3:
				this.day = parseInt(d[2])
			case 2:
				this.month = parseInt(d[1])
			case 1:
				this.year = parseInt(d[0])
			}
		}
	}

	cmp(target) {
		if (this.year < target.year)
			return -1

		if (this.year > target.year)
			return 1

		if (this.month < target.month)
			return -1

		if (this.month < target.month)
			return 1

		if (this.day < target.day)
			return -1

		if (this.day < target.day)
			return 1

		return 0
	}

	to_string() {
		let s = ""
		if (this.approx) {
			s = sym.APPROX
		}

		if (this.year) {
			s = s + this.year
		}
		if (this.month) {
			let month = this.month.toString()
			if (month.length == 1) {
				month = "0" + month
			}
			s = s + "-" + month
		}
		if (this.day) {
			let day = this.day.toString()
			if (day.length == 1) {
				day = "0" + day
			}
			s = s + "-" + day
		}

		return s
	}
}
