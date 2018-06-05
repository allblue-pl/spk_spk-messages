'use strict';

const
    js0 = require('js0'),
    spocky = require('spocky'),

    $layouts = require('./$layouts')
;

export default class Messages extends spocky.Module
{

    constructor(images)
    { super();
        js0.args(arguments, js0.Preset({
            loading: 'string',
            success: 'string',
            failure: 'string',
        }));

        this._images = images;

        this._msg_Fn = null;
        this._confirmation_Fn = null;

        this._l = new $layouts.Messages();

        this._l.$fields.loading.image = this._images.loading;

        this.hide();

        this._createElems();

        this.$view = this._l;
    }

    hide()
    {
        this.hideConfirmation();
        this.hideLoading();
        this.hideMessage();
    }

    hideConfirmation(result = false)
    {
        this._l.$fields.confirmation = {
            show: false,
            text: '',
            yes: '',
            no: '',
        };

        if (this._confirmation_Fn !== null) {
            this._confirmation_Fn(result);
            this._confirmation_Fn = null;
        }
    }

    hideLoading()
    {
        this._l.$fields.loading = {
            show: false,
            text: '',
        };
    }

    hideMessage()
    {
        this._l.$fields.message = {
            show: false,
            image: '',
            text: '',
        };

        if (this._msg_Fn !== null) {
            this._msg_Fn();
            this._msg_Fn = null;
        }
    }

    showConfirmation(text, yesText, noText, fn)
    {
        this._confirmation_Fn = fn;

        this._l.$fields.confirmation = {
            text: text,
            yes: yesText,
            no: noText,
            show: true
        };
    }

    showLoading(text = '')
    {
        this._l.$fields.loading = {
            text: text,
            show: true,
        };
    }

    showMessage(imageSrc, text, fn = null)
    {
        js0.args(arguments, 'string', 'string', [ js0.Default, js0.Null, 'function' ]);

        this._msg_Fn = fn;
        this._enabled = false;

        this._l.$fields.message = {
            image: imageSrc,
            text: text,
            show: true
        };
    }

    showMessage_Failure(text, fn = null)
    {
        js0.args(arguments, 'string', [ js0.Default, 'function' ]);

        this.showMessage(this._images.failure, text, fn);
    }

    showMessage_Success(text, fn = null)
    {
        js0.args(arguments, 'string', [ js0.Default, 'function' ]);

        this.showMessage(this._images.success, text, fn);
    }


    _createElems()
    {
        this._l.$elems.message.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.hideMessage();
        });

        this._l.$elems.yes.addEventListener('click', (evt) => {
            evt.preventDefault();

            this.hideConfirmation(true);
        });

        this._l.$elems.no.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.hideConfirmation(false);
        });
    }

}