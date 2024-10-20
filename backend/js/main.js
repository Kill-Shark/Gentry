/*
 * main.js
 */

import {Gen} from "./gen.js"

let gen
let tree

let zoom = 1.0
let pan_x = 0
let pan_y = 0

//кнопки в navbar
const
btnPerson = document.getElementById("btnPerson"),
btnTree = document.getElementById("btnTree"),
btnEvent = document.getElementById("btnEvent"),
btnDocs = document.getElementById("btnDocs"),
btnMaps = document.getElementById("btnMaps"),
btnSettings = document.getElementById("btnSettings"),
btnCreate = document.getElementById("btnCreate"),
btnLoad = document.getElementById("btnLoad"),
btnLoadInput = document.getElementById("btnLoadInput"),
btnSave = document.getElementById("btnSave"),
btnMode = document.getElementById("btnMode"),
btnExport = document.getElementById("btnExport");

const dropdown = document.getElementById("dropdown")

const sectionPerson = document.getElementById("sectionPerson")
const sectionTree = document.getElementById("sectionTree")
const sectionEvent = document.getElementById("sectionEvent")
const sectionDocument = document.getElementById("sectionDocument")
const sectionMap = document.getElementById("sectionMap")

// автоматическое закрытие панели настроек после нажатия кнопки
document.querySelectorAll(".dropdown-bar").forEach(n => n.addEventListener("click", ()=>{
	dropdown.classList.add("closed");
}))
btnSettings.addEventListener("mousemove", () => {
	dropdown.classList.remove("closed");
})

btnLoadInput.addEventListener("change", (e) => {
	read_file(e.target.files[0])
})

function read_file(file){
	let reader = new FileReader()
	reader.readAsArrayBuffer(file);

	reader.onload = function() {
		let view = new Uint8Array(reader.result)
		gen = new Gen(view)
		if (gen.err) {
			console.log(gen.err)
			gen = undefined
		}
	}

	reader.onerror = function() {
		console.log("Failed to read a file")
	}
}

// TEMP
let tree_type = "common"

btnTree.addEventListener("click", build_tree)

function build_tree(e) {
	if (gen == undefined)
		return

	tree = gen.tree_get(tree_type)
	zoom = tree.fit(sectionTree)
	tree.draw(sectionTree, zoom, pan_x, pan_y)

	// TEMP
	if (tree_type == "common") {
		tree_type = "layout"

	} else if (tree_type == "layout") {
		tree_type = "common"
	}

	cleanSectionClasses()
	sectionTree.style.display = "block";
}

sectionTree.addEventListener("wheel", (e) => {
	if (e.deltaY < 0) {
		zoom += 0.1 * zoom
		pan_x = pan_x + (pan_x - e.x) * 0.1
		pan_y = pan_y + (pan_y - e.y) * 0.1

	} else {
		zoom -= 0.1 * zoom
		pan_x = pan_x - (pan_x - e.x) * 0.1
		pan_y = pan_y - (pan_y - e.y) * 0.1
	}

	if (tree != undefined)
		tree.draw(sectionTree, zoom, pan_x, pan_y)
});

sectionTree.addEventListener("mousemove", (e) => {
	if (e.buttons == 1) {
		pan_x += e.movementX
		pan_y += e.movementY
		if (tree != undefined)
			tree.draw(sectionTree, zoom, pan_x, pan_y)
	}
});

function cleanSectionClasses(){
	sectionPerson.classList.remove("sectionActive")
	sectionTree.style.display = "none";
	sectionEvent.classList.remove("sectionActive")
	sectionDocument.classList.remove("sectionActive")
	sectionMap.classList.remove("sectionActive")

}

btnEvent.addEventListener("click", switchToEventSection)
btnPerson.addEventListener("click", switchToPersonSection)
btnDocs.addEventListener("click", switchToDocumentSection)
btnMaps.addEventListener("click", switchToMapsSection)

function switchToEventSection(){
	cleanSectionClasses()
	sectionEvent.classList.add("sectionActive")
}

function switchToPersonSection(){
	cleanSectionClasses()
	sectionPerson.classList.add("sectionActive")
}

function switchToDocumentSection(){
	cleanSectionClasses()
	sectionDocument.classList.add("sectionActive")
}

function switchToMapsSection(){
	cleanSectionClasses()
	sectionMap.classList.add("sectionActive")
}