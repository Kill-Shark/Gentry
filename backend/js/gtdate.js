/*
 * gtdate.js
 */

import * as sym from "./sym.js"

const months = {
	1: ["январь", "января"],
	2: ["февраль", "февраля"],
	3: ["март", "марта"],
	4: ["апрель", "апреля"],
	5: ["май", "мая"],
	6: ["июнь", "июня"],
	7: ["июль", "июля"],
	8: ["август", "августа"],
	9: ["сентябрь", "сентября"],
	10: ["окрябрь", "октября"],
	11: ["ноябрь", "ноября"],
	12: ["декабрь", "декабря"]
}

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

	diff(date) {
		; // TODO
	}

	to_string() {
		let s = ""
		if (this.approx)
			s = sym.APPROX

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

	to_human_string() {
		let s = ""
		if (this.approx) {
			s = sym.APPROX
			s += this.year.toString()
			return s
		}

		if (this.day)
			s += this.day.toString() + " "

		if (this.month)
			s += months[this.month][1] + " "

		if (this.year)
			s += this.year.toString()

		return s
	}
}
