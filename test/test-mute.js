/* global exports, require */

require("../lib/main.js");

const { Task } = require("chrome").Cu.import("resource://gre/modules/Task.jsm", {});
const { viewFor } = require("sdk/view/core");

const { openTab, url, wait } = require("./common.js");

exports.testMuteAudio = function*(test) {
	let tab = yield openTab(url("/test/files/audio.html"));
	yield basicTest(tab, (doc) => doc.querySelector("audio"), test);
};

exports.testMuteVideo = function*(test) {
	let tab = yield openTab(url("/test/files/lynx.webm"));
	yield basicTest(tab, (doc) => doc.querySelector("video"), test);
};

exports.testMuteVideoInFrame = function*(test) {
	let tab = yield openTab(url("/test/files/video-frame.html"));
	yield basicTest(tab, (doc) => {
		return doc.querySelector("iframe").contentWindow.document.querySelector("video");
	}, test);
};

exports.testPauseWhileMuted = function*(test) {
	let tab = yield openTab(url("/test/files/video-frame.html"));

	yield wait();

	let xulTab = viewFor(tab);
	let chromeDocument = xulTab.ownerDocument;
	let indicator = chromeDocument.getAnonymousElementByAttribute(xulTab, "anonid", "noise-indicator");

	// TODO: don't do this.
	let contentWindow = xulTab.linkedBrowser.contentWindow;
	let contentDocument = contentWindow.document;
	let video1 = contentDocument.querySelector("video");
	let video2 = contentDocument.querySelector("iframe").contentWindow.document.querySelector("video");

	video1.play(); // video2 autoplays.

	yield wait();

	indicator.click();
	yield wait();
	test.equal(indicator.classList.contains("muted"), true);
	test.notEqual(indicator.getAttribute("collapsed"), "true", "indicator not hidden");
	test.equal(video1.muted, true);
	test.equal(video2.muted, true);

	video1.pause();
	yield wait();
	test.equal(indicator.classList.contains("muted"), true);
	test.notEqual(indicator.getAttribute("collapsed"), "true", "indicator not hidden");
	test.equal(video1.muted, true);
	test.equal(video2.muted, true);

	tab.close();
};

require("sdk/test").run(exports);

function basicTest(tab, elementSelector, test) {
	return Task.spawn(function*() {
		yield wait();

		let xulTab = viewFor(tab);
		let chromeDocument = xulTab.ownerDocument;
		let indicator = chromeDocument.getAnonymousElementByAttribute(xulTab, "anonid", "noise-indicator");

		test.notEqual(indicator, null, "indicator exists");
		test.notEqual(indicator.getAttribute("collapsed"), "true", "indicator is shown");

		// TODO: don't do this.
		let contentWindow = xulTab.linkedBrowser.contentWindow;
		let contentDocument = contentWindow.document;
		let video = elementSelector(contentDocument);

		test.equal(video.muted, false);
		indicator.click();
		yield wait();
		test.equal(indicator.classList.contains("muted"), true);
		test.notEqual(indicator.getAttribute("collapsed"), "true", "indicator not hidden");
		test.equal(video.muted, true);

		indicator.click();
		yield wait();
		test.equal(indicator.classList.contains("muted"), false);
		test.notEqual(indicator.getAttribute("collapsed"), "true", "indicator not hidden");
		test.equal(video.muted, false);

		indicator.click();
		yield wait();
		video.muted = false;
		yield wait();
		test.equal(indicator.classList.contains("muted"), false);
		test.notEqual(indicator.getAttribute("collapsed"), "true", "indicator not hidden");

		tab.close();
	});
}
