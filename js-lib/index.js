'use strict';

const
    abText = require('ab-text'),
    js0 = require('js0')
;

class spkMessages_Class {

    get Messages() {
        return require('./Messages');
    }


    get debug() {
        return this._debug;
    }


    constructor() {
        this._debug = false;
    }

    setDebug(debug) {
        js0.args(arguments, 'boolean');

        this._debug = debug;
    }

    text(text) {
        js0.args(arguments, 'string');

        return abText.$(`spkMessages.${text}`);
    }

}
export default spkMessages = new spkMessages_Class();