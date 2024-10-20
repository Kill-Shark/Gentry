/*
 * tree.js
 */

import * as nd from "./node.js"
import {Node} from "./node.js"

import {randint} from "./random.js"
import {rand_seed_set} from "./random.js"

import * as sym from "./sym.js"

const BIG = 1000000
const HUGE = 999999999

const VIEW = {
	name: "default",
	type: sym.COMMON,
	w: 10,
	h: 5,
	gap: 1,
	margin: 0.5,
	color: {
		male: "#9999cc",
		female: "#cc9999"
	},
	base: 0,

	fw: 12,
	fh: 7
}

export class Tree {
	constructor(people, bg="#222222") {
		let nodes = people.slice()
		for (let i in people)
			nodes[i] = new Node(people[i])

		for (let i in nodes) {
			for (let k in people[i].parents) {
				let p = people[i].parents[k]
				nodes[i].parents.push(nodes[p.num])
			}
			for (let k in people[i].mates) {
				let p = people[i].mates[k]
				nodes[i].mates.push(nodes[p.num])
			}
			for (let k in people[i].children) {
				let p = people[i].children[k]
				nodes[i].children.push(nodes[p.num])
			}
		}

		this.nodes = nodes

		this.bg = bg
	}

	foreach(func) {
		for (let i in this.nodes) {
			let node = this.nodes[i]
			if (node.is_hidden())
				continue

			func(node)
		}
	}

	build(view=VIEW) {
		this.view = view

		this.foreach((node) => {
			node.clear()
		})

		switch (view.type) {
		case sym.COMMON:
			this.foreach((node) => {
				node.y = node.person.get_y()
			})

			let base = this.nodes[view.base]
			base.x = 0
			base.spread(this.nodes, view)

			this.foreach((node) => {
				node.x *= 2
			})
			break

		case sym.LAYOUT:
			this.foreach((node) => {
				node.x = 0
				node.hue = 0
				node.y = node.person.get_y()
			})

			for (let i in view.layout) {
				let layout = view.layout[i]
				let num = layout[sym.SUBJECT]
				let node = this.nodes[num]

				if ("x" in layout)
					node.x = layout.x

				if ("y" in layout)
					node.y = layout.y

				if ("hue" in layout)
					node.hue = layout.hue
			}
			break
		}

		this.foreach((node) => {
			node.get_root(view)
		})

		this.min_x = 9999999999
		this.min_y = 9999999999

		this.max_x = 0
		this.max_y = 0

		for (let i in this.nodes) {
			let node = this.nodes[i]
			if (node.is_hidden())
				continue

			if (node.x < this.min_x)
				this.min_x = node.x
			if (node.y < this.min_y)
				this.min_y = node.y

			if (node.x > this.max_x)
				this.max_x = node.x
			if (node.y > this.max_y)
				this.max_y = node.y
		}

		this.min_x -= view.w
		this.min_y -= view.h

		this.max_x += view.w
		this.max_y += view.h
	}

	fit(sheet) {
		return sheet.height / (this.max_y - this.min_y)
	}

	draw(sheet, zoom, pan_x, pan_y) {
		let ctx = sheet.getContext("2d")

		let w = this.view.w * zoom
		let h = this.view.h * zoom

		rand_seed_set(0)

		for (let i in this.nodes) {
			let node = this.nodes[i]
			if (node.is_hidden())
				continue

			if (node.hue == undefined)
				node.hue = randint(360)

			node.tx = (node.x - this.min_x) * zoom + pan_x
			node.ty = (node.y - this.min_y) * zoom + pan_y
			node.rx = node.tx - w / 2
			node.ry = node.ty - h / 2

			node.root_tx = (node.root_x - this.min_x) * zoom + pan_x
			node.root_ty = (node.root_y - this.min_y) * zoom + pan_y
		}

		ctx.fillStyle = this.bg
		ctx.fillRect(0, 0, sheet.width, sheet.height)

		let line = this.nodes.slice()
		line.sort((a, b) => a.y < b.y)
		for (let i in line) {
			let node = line[i]
			if (node.is_hidden())
				continue

			ctx.beginPath()

			for (let k in node.mates) {
				let mate = node.mates[k]
				if (mate.is_hidden())
					continue

				let mid = node.get_middle(mate, this.view)
				let mid_x = (mid[0] - this.min_x) * zoom + pan_x
				let mid_y = (mid[1] - this.min_y) * zoom + pan_y

				let node_grab_x = 0
				let mate_grab_x = 0
				if (mate.x > node.x) {
					node_grab_x = node.rx + w
					mate_grab_x = mate.rx
					node.connections[1] = true

				} else {
					node_grab_x = node.rx
					mate_grab_x = mate.rx + w
					node.connections[3] = true
				}

				let mmid_x = (node_grab_x + mid_x) / 2
				this.draw_curve(ctx, 4, node.hue,
								mid_x, mid_y,
								mmid_x, mid_y,
								mmid_x, node.ty,
								node_grab_x, node.ty)
			}

			if (node.root_x != undefined) {
				node.connections[0] = true

				let mid_y = (node.ry + node.root_ty) / 2

				this.draw_curve(ctx, 4, node.hue,
								node.tx, node.ty - h / 2,
								node.tx, mid_y, node.root_tx, mid_y, node.root_tx, node.root_ty)
			}
		}

		for (let i in this.nodes) {
			let node = this.nodes[i]
			if (node.is_hidden())
				continue

			ctx.lineWidth = 8
			ctx.strokeStyle = this.bg
			ctx.strokeRect(node.rx, node.ry, w, h)

			ctx.lineWidth = 4
			ctx.strokeStyle = "HSL(" + node.hue + ", 20%, 50%)"
			ctx.strokeRect(node.rx, node.ry, w, h)

			ctx.fillStyle = "HSL(" + node.hue + ", 20%, 50%)"

			let t = 6
			let th = 3

			if (node.connections[0])
				ctx.fillRect(node.tx - th, node.ry - t, t, t)

			if (node.connections[1])
				ctx.fillRect(node.rx + w, node.ty - th, t, t)

			if (node.connections[2])
				ctx.fillRect(node.tx - th, node.ry + h, t, t)

			if (node.connections[3])
				ctx.fillRect(node.rx - t, node.ty - th, t, t)

			ctx.fillStyle = this.view.color[node.person.sex]
			ctx.fillRect(node.rx, node.ry, w, h)

			ctx.fillStyle = "#111111"
			let fs = h / 9
			ctx.font = "" + fs + "px sans"

			let title_ratio = 0.75
			if (node.title_ratio)
				title_ratio = node.title_ratio

			let margin = this.view.margin * zoom
			let title_h = h - margin * 2
			let title_w = title_h * title_ratio
			let info_x = margin * 2 + title_w

			let ceil = node.ty - h * 0.3
			let step = fs * 1.2
			let x = node.rx + info_x

			let p = node.person
			if (sym.LAST in p.name_actual) {
				ctx.fillText(p.name_actual[sym.LAST], x, ceil)
				if (sym.LAST in p.name_birth && p.name_birth[sym.LAST] != p.name_actual[sym.LAST])
					ctx.fillText("(" + p.name_birth[sym.LAST] + ")", x, ceil + step)
			}
			if (sym.FIRST in p.name_actual)
				ctx.fillText(p.name_actual[sym.FIRST], x, ceil + step * 2)
			if (sym.PATRONYM in p.name_actual)
				ctx.fillText(p.name_actual[sym.PATRONYM], x, ceil + step * 3)

			if (p.birth)
				ctx.fillText("* " + p.birth.to_string(), x, ceil + step * 4)
			if (p.death)
				ctx.fillText("+ " + p.death.to_string(), x, ceil + step * 5)

			if (p.title)
				ctx.drawImage(p.title,
							  node.rx + margin,
							  node.ry + margin,
							  title_w,
							  title_h)
		}
	}

	draw_curve(ctx, width, hue, x0, y0, x1, y1, x2, y2, x3, y3) {
		ctx.lineWidth = width * 2
		ctx.strokeStyle = this.bg
		ctx.moveTo(x0, y0)
		ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3)
		ctx.stroke()

		ctx.lineWidth = width
		ctx.strokeStyle = "HSL(" + hue + ", 20%, 50%)"
		ctx.moveTo(x0, y0)
		ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3)
		ctx.stroke()
	}

	draw_qcurve(ctx, width, hue, x0, y0, x1, y1, x2, y2) {
		ctx.lineWidth = width * 2
		ctx.strokeStyle = this.bg
		ctx.moveTo(x0, y0)
		ctx.quadraticCurveTo(x1, y1, x2, y2)
		ctx.stroke()

		ctx.lineWidth = width
		ctx.strokeStyle = "HSL(" + hue + ", 20%, 50%)"
		ctx.moveTo(x0, y0)
		ctx.quadraticCurveTo(x1, y1, x2, y2)
		ctx.stroke()
	}
}
