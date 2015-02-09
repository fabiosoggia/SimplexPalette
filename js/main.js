/*
 * Simplex Color
 *
 * Copyright 2014, Fabio Soggia
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 */

/**
 * Hash function which return an int for each string.
 * @param str String
 * @return int
 */
function djb2(str) {
	var hash = 5381;
	for (i = 0; i < str.length; i++) {
		char = str.charCodeAt(i);
		hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
	}
	return hash;
}

/**
 * Convert rgb color (with r, g and b value between 0 and 1), to
 * css hex string (#rrggbb).
 * @param color Object
 * @return String
 */
function rgbToHex(color) {
	var r = color.r * 0xff;
	r = Math.min(r, 0xff);
	r = Math.max(r, 0x00);

	var g = color.g * 0xff;
	g = Math.min(g, 0xff);
	g = Math.max(g, 0x00);

	var b = color.b * 0xff;
	b = Math.min(b, 0xff);
	b = Math.max(b, 0x00);

	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1,7);
}

/**
 * Generate a random color with simplex2 for coord x and y.
 * @param x Number
 * @param y Number
 * @return Object the color with r, g and b attribute between 0 and 1.
 */
function generateRandomColor(x, y, seed) {

	// Set the seed
	noise.seed(djb2(seed));

	// x and y for green anb blue channel are shifted by 1 shift
	// and 2 shift respectively.
	var shift = 1000;

	var red_x = x /* + (shift * 0) */;
	var red_y = y /* + (shift * 0) */;

	var green_x = x + (shift * 1);
	var green_y = y + (shift * 1);

	var blue_x = x + (shift * 2);
	var blue_y = y + (shift * 2);

	return {
		r: Math.abs(noise.simplex2(red_x, red_y)),
		g: Math.abs(noise.simplex2(green_x, green_y)),
		b: Math.abs(noise.simplex2(blue_x, blue_y))
	};

}

function create(tag) {
	return $(document.createElement(tag));
}

// Settings -------------------------------------------------------------------

/**
 * Colums and row number.
 */
var cols = 50;
var rows = 120;

/**
 * Chunck size.
 */
var size = cols * rows;
var count = 0;

var current_seed = "You are welcome.";

/**
 * DOM elements.
 */
var $seed = $("#seed");
var $bg = $("#bg");
var $progressBar = $("#loader");


function generateChunck (seed) {

	var root = $bg;
	var frequency = 100;

	for (var i = 0; i < size; i++) {

		var row = Math.floor((i + count) / cols);
		var col = (i + count) % cols;

		var x = col / frequency;
		var y = row / frequency;

		var color = generateRandomColor(x, y, seed);
		var css_color = rgbToHex(color);

		var block = create('div');
		block.addClass('block');
		block.css('background', css_color);
		root.append(block);

	}
	count += size;
}

function addChangeTextListener (input, callback) {
	if (!callback) return;
	input = $(input);
	input.keyup(function () {
		var PREVIUS_ATTRIBUTE = 'previous-text';
		var currentText = input.val();
		var previousText = input.data(PREVIUS_ATTRIBUTE);
		// If the text was not changed return.
		if (currentText == previousText) return;
		input.data(PREVIUS_ATTRIBUTE, currentText);
		callback(input);
	});
}

function clearElementTimeout (el) {
	el = $(el);
	var timer = el.data('timer');
	if (timer !== null) {
		clearTimeout(timer);
	}
}

function setElementTimeout (el, callback, duration) {
	el = $(el);
	clearElementTimeout(el);
	var timer = setTimeout(function () {
		callback(el);
	}, duration);
	el.data('timer', timer);
}

function showLoadingAnimation () {
	$progressBar.removeClass("loading");
	var element = $progressBar[0];
	element.offsetWidth = element.offsetWidth;
	$progressBar.addClass("loading");
}

function updateUrl (seed) {
	window.location.hash = window.encodeURIComponent(seed);
}

addChangeTextListener($seed, function () {
	showLoadingAnimation();
	setElementTimeout($seed, function () {
		// reset
		$bg.html('');
		count = 0;
		// generate chunk
		current_seed = $seed.val();
		generateChunck(current_seed);
		// set URI
		window.location.hash = window.encodeURIComponent(current_seed);
	}, 2000);
});


// window.onscroll = function () {
// 	var scrollPercentage = (document.body.scrollTop + window.innerHeight) / (document.body.scrollHeight);
// 	console.log(scrollPercentage);
// 	if (scrollPercentage > 0.85) {
// 		generateChunck(current_seed);
// 	}
// }


var hash = window.location.hash;
if (hash !== null) {
	hash = hash.substring(1);	// remove "#"
	hash = window.decodeURIComponent(hash);
	current_seed = hash;
	$seed.val(current_seed);
}
console.log("Start seed is: " + current_seed);
generateChunck(current_seed);

