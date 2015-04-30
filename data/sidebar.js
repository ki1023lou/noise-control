/* globals addon */
let windowsList = document.getElementById("windows");

addon.port.on("everything", function(windows) {
	let muteLabel = " " + document.getElementById("mutelabel").textContent;

	windowsList.innerHTML = "";
	for (let tabs of windows) {
		let windowItem = document.createElement("li");
		let tabsList = document.createElement("ul");
		for (let tab of tabs) {
			let listItem = document.createElement("li");
			listItem.setAttribute("id", tab.id);
			listItem.innerHTML =
				'<div class="tabicon"><img src="defaultFavicon.png" /></div>' +
				'<div class="tabtitle">hexy.ogg</div>' +
				'<div class="tabmute"><label><input type="checkbox" /><span class="mutelabel"></span></label></div>';
			listItem.querySelector("input[type=\"checkbox\"]").onclick = onMuteClick;
			listItem.querySelector("span.mutelabel").textContent = muteLabel;
			updateTab(listItem, tab);
			tabsList.appendChild(listItem);
		}
		windowItem.appendChild(tabsList);
		windowsList.appendChild(windowItem);
	}
});

addon.port.on("tabchanged", function(tab) {
	let listItem = document.getElementById(tab.id);
	updateTab(listItem, tab);
});

function getListItem(element) {
	let listItem = element.parentNode;
	while (listItem && listItem.localName != "li") {
		listItem = listItem.parentNode;
	}
	return listItem;
}

function onMuteClick() {
	let listItem = getListItem(this);

	addon.port.emit("audioStateChanged", {
		id: listItem.id,
		state: this.checked
	});
}

function updateTab(listItem, tab) {
	listItem.querySelector(".tabicon > img").src = tab.icon ? tab.icon : "chrome://mozapps/skin/places/defaultFavicon.png";
	listItem.querySelector(".tabtitle").textContent = tab.title;
	listItem.querySelector("input[type=\"checkbox\"]").checked = tab.noisy.indexOf("muted") >= 0;
}
