'use strict';

const
    js0 = require('js0')
;

class spkMessages_Class
{

    get Messages() {
        return require('./Messages');
    }


    get debug() {
        return this._debug;
    }


    constructor() {
        this._debug = false;
        this._textFn = (text) => {
            return this._texts[text];
        };  
        this._texts = {
            Close: 'Close',
        };
    }

    setDebug(debug) {
        js0.args(arguments, 'boolean');

        this._debug = debug;
    }

    setTextFn(textFn) {
        js0.args(arguments, 'function');

        this._textFn = textFn;
    }

    text(text) {
        js0.args(arguments, 'string');

        return this._textFn(text);
    }

}
export default spkMessages = new spkMessages_Class();