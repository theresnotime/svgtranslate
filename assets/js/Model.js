global.App = require( './App.js' );
global.OO = require( '../../node_modules/oojs/dist/oojs.js' );

/**
 * @constructor
 * @param {Object} translations All existing translation strings.
 */
App.Model = function appModel( translations ) {
	OO.EventEmitter.call( this );
	this.localStorageKey = 'svgtranslate';
	this.translations = translations || {};
	this.sourceLang = null;
	this.targetLang = null;
	this.langs = this.getLangs( this.translations );
};

OO.mixinClass( App.Model, OO.EventEmitter );

/**
 * Get all available languages (note that translations may not be complete for all).
 *
 * @param {Object} translations
 * @return {Array}
 */
App.Model.prototype.getLangs = function ( translations ) {
	var t, l, langs, lang,
		tspans = Object.keys( translations ),
		out = [];
	for ( t = 0; t < tspans.length; t++ ) {
		langs = Object.keys( translations[ tspans[ t ] ] );
		for ( l = 0; l < langs.length; l++ ) {
			lang = langs[ l ];
			// If it's not already in the list, add it.
			if ( out.indexOf( lang ) === -1 ) {
				out.push( lang );
			}
		}
	}
	return out;
};

/**
 * Set the source language.
 *
 * @param {string} lang The source language code.
 */
App.Model.prototype.setSourceLang = function ( lang ) {
	// Make sure the source lang exists.
	if ( this.langs.indexOf( lang ) === -1 ) {
		return;
	}
	// If it's difference from the current value, change it.
	if ( lang !== this.sourceLang ) {
		this.sourceLang = lang;
		this.saveToLocalStorage( 'sourceLang', lang );
		this.emit( 'sourceLangSet' );
	}
};

/**
 * Get the source language code.
 *
 * @return {string}
 */
App.Model.prototype.getSourceLang = function () {
	return this.sourceLang;
};

/**
 * Set the target language.
 *
 * @param {string} lang The target language code.
 */
App.Model.prototype.setTargetLang = function ( lang ) {
	if ( lang !== undefined && lang !== '' && lang !== this.targetLang ) {
		this.targetLang = lang;
		this.saveToLocalStorage( 'targetLang', lang );
		this.emit( 'targetLangSet' );
	}
};

/**
 * Get the target language code.
 *
 * @return {string}
 */
App.Model.prototype.getTargetLang = function () {
	return this.targetLang;
};

/**
 * @param {string} nodeId
 * @return {Object} With properties 'label' (string) and 'exists' (bool). If exists is false then
 * the label will be a message informing the user of this.
 */
App.Model.prototype.getSourceTranslation = function ( nodeId ) {
	// If there's no translation for this node ID, return an error message.
	if ( this.translations[ nodeId ][ this.sourceLang ] === undefined ) {
		return {
			label: this.translations[ nodeId ].fallback.text,
			exists: false
		};
	}
	return {
		label: this.translations[ nodeId ][ this.sourceLang ].text,
		exists: true
	};
};

App.Model.prototype.getTargetTranslation = function ( nodeId ) {
	if ( this.translations[ nodeId ][ this.targetLang ] === undefined ) {
		return '';
	}
	return this.translations[ nodeId ][ this.targetLang ].text;
};

/**
 * Load model values from LocalStorage.
 */
App.Model.prototype.loadFromLocalStorage = function () {
	this.setSourceLang( this.getLocalStorageValue( 'sourceLang' ) );
	this.setTargetLang( this.getLocalStorageValue( 'targetLang' ) );
};

/**
 * Get a value from our LocalStorage item.
 * @protected
 * @param {string} key
 * @return {*}
 */
App.Model.prototype.getLocalStorageValue = function ( key ) {
	var val, data;
	if ( global.localStorage === undefined ) {
		return;
	}
	data = JSON.parse( global.localStorage.getItem( this.localStorageKey ) );
	if ( data !== null && data[ key ] !== undefined ) {
		val = data[ key ];
	}
	return val;
};

/**
 * Set a value in our LocalStorage item.
 * @protected
 * @param {string} key
 * @param {*} val
 */
App.Model.prototype.saveToLocalStorage = function ( key, val ) {
	var data;
	if ( global.localStorage === undefined ) {
		return;
	}
	data = JSON.parse( global.localStorage.getItem( this.localStorageKey ) );
	if ( data === null ) {
		data = {};
	}
	data[ key ] = val;
	global.localStorage.setItem( this.localStorageKey, JSON.stringify( data ) );
};
