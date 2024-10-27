/*
 * main.js
 */

import {Gen} from "./gen.js"

let gen
let tree

//стартовые кнопки

const 
btnCreateStart = document.getElementById("btnCreateStart"),
btnLoadInputStart = document.getElementById("btnLoadInputStart")

//кнопки в navbar
const
btnLogo = document.getElementById("btnLogo"),
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

const sidePanel = document.getElementById("sidePanel")
const sidePanelBtn = document.getElementById("sidePanelBtn")
const sidePanelInfo = document.getElementById("sidePanelInfo")

const sidePanelImg = document.getElementById("sidePanelImg")
const sidePanelLastName = document.getElementById("sidePanelLastName")
const sidePanelRestName = document.getElementById("sidePanelRestName")
const sidePanelBirthDate = document.getElementById("sidePanelBirthDate")
const sidePanelBirthPlace = document.getElementById("sidePanelBirthPlace")
const sidePanelAgeNum = document.getElementById("sidePanelAgeNum")
const sidePanelDeathDate = document.getElementById("sidePanelDeathDate")
const sidePanelDeathPlace = document.getElementById("sidePanelDeathPlace")
const sidePanelDeathCause = document.getElementById("sidePanelDeathCause")
const sidePanelFatherName = document.getElementById("sidePanelFatherName")
const sidePanelMotherName = document.getElementById("sidePanelMotherName")

const btnArrow = document.getElementById("btnArrow")

const starterPage = document.getElementById("starterPage")
const loadedPage = document.getElementById("loadedPage")

// автоматическое закрытие панели настроек после нажатия кнопки
document.querySelectorAll(".dropdown-bar").forEach(n => n.addEventListener("click", ()=>{
	dropdown.classList.add("closed");
}))
btnSettings.addEventListener("mousemove", () => {
	dropdown.classList.remove("closed");
})

//стартовая страница
btnLoadInputStart.addEventListener("change", (e) => {
	starterPage.style.display = "none";
	loadedPage.style.display = "flex";
	read_file(e.target.files[0])

	sectionPerson.classList.add("sectionActive")
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
	tree.fit(sectionTree)
	tree.draw(sectionTree)

	// TEMP
	if (tree_type == "common") {
		tree_type = "layout"

	} else if (tree_type == "layout") {
		tree_type = "common"
	}

	cleanSectionClasses()
	sectionTree.style.display = "block";
	sidePanel.style.display = "grid"
}

sectionTree.addEventListener("wheel", (e) => {
	if (tree == undefined)
		return

	if (e.deltaY < 0) {
		tree.zoom_in(e.x, e.y)

	} else {
		tree.zoom_out(e.x, e.y)
	}

	tree.draw(sectionTree)
});

sectionTree.addEventListener("mousemove", (e) => {
	if (tree == undefined)
		return

	if (e.buttons == 1) {
		tree.pan_x += e.movementX
		tree.pan_y += e.movementY
		tree.draw(sectionTree)
	}
});

sectionTree.addEventListener("mousedown", (e) => {
	if (tree == undefined)
		return

	tree.mpx = e.x
	tree.mpy = e.y
});

sectionTree.addEventListener("click", (e) => {
	if (tree == undefined)
		return

	if (Math.abs(tree.mpx - e.x) + Math.abs(tree.mpy - e.y) > 5)
		return

	let node = tree.get_at(e.layerX, e.layerY)
	if (node) {
		let data = node.person.get_data()

		if (data["title"])
			sidePanelImg.src = data["title"].src
		else
			sidePanelImg.src = "./frontend/img/no-image.webp"

		sidePanelLastName.innerHTML = data["last_name"]
		sidePanelRestName.innerHTML = data["rest_name"]

		if (data["birth"])
			sidePanelBirthDate.innerHTML = data["birth"]
		else
			sidePanelBirthDate.innerHTML = "-"


		if (data["birth_place"])
			sidePanelBirthPlace.innerHTML = data["birth_place"]
		else
			sidePanelBirthPlace.innerHTML = "-"

		if (data["age"])
			sidePanelAgeNum.innerHTML = data["age"]
		else
			sidePanelAgeNum.innerHTML = "-"

		if (data["death"])
			sidePanelDeathDate.innerHTML = data["death"]
		else
			sidePanelDeathDate.innerHTML = "-"

		if (data["death_place"])
			;
		else
			sidePanelDeathPlace.innerHTML = "-"

		if (data["death_cause"])
			;
		else
			sidePanelDeathCause.innerHTML = "-"

		if (data["father"])
			;
		else
			sidePanelFatherName.innerHTML = "-"

		if (data["mother"])
			;
		else
			sidePanelMotherName.innerHTML = "-"

		tree.draw(sectionTree)

		sidePanel.classList.add("toggleSidePanel");
		sidePanelInfo.classList.add("toggleSidePanelInfo")

	} else {
		sidePanel.classList.remove("toggleSidePanel");
		sidePanelInfo.classList.remove("toggleSidePanelInfo")
	}
});

function cleanSectionClasses(){
	sectionPerson.classList.remove("sectionActive")
	sectionTree.style.display = "none";
	sidePanel.style.display = "none";
	sectionEvent.classList.remove("sectionActive")
	sectionDocument.classList.remove("sectionActive")
	sectionMap.classList.remove("sectionActive")

}

// btnLogo.addEventListener("click", switchToLogoSection)
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

// function switchToLogoSection(){
// 	cleanSectionClasses()
// 	starterPage.style.display = "flex"
// }
