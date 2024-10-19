'use strict';

const
    js0 = require('js0'),
    spocky = require('spocky'),

    spkMessages = require('.'),

    $layouts = require('./$layouts')
;

export default class Messages extends spocky.Module
{

    constructor(presets = {}, layout = null)
    { super();
        js0.args(arguments, [ js0.RawObject, js0.Default ], 
                [ spocky.Layout, js0.Null, js0.Default ]);
        js0.typeE(presets, js0.Preset({
            modulePath: [ 'string', js0.Default('/dev/node_modules/spk-messages/'), ],
            images: [ js0.Preset({
                loading: [ 'string', js0.NotSet, js0.Default(js0.NotSet), ],
                success: [ 'string', js0.NotSet, js0.Default(js0.NotSet), ],
                failure: [ 'string', js0.NotSet, js0.Default(js0.NotSet), ],
            }), js0.Default({}) ],
        }));

        if (presets.images.loading === js0.NotSet)
            presets.images.loading = null;
        if (presets.images.success === js0.NotSet)
            presets.images.success = presets.modulePath + 'images/success.png';
        if (presets.images.failure === js0.NotSet)
            presets.images.failure = presets.modulePath + 'images/failure.png';

        this.loading_MinTime = 500;
        this.loading_Timeout = 500;

        this._loading = false;
        this._loading_Start = null;

        this._images = presets.images;

        this._msg = null;
        this._msg_Fn = null;

        this._confirmation = null;
        this._confirmation_Fn = null;
        this._confirmation_Result = null;

        this._l = layout === null ? new $layouts.Messages() : layout;

        this._l.$fields.Loading.Image = this._images.loading;
        this._l.$fields.Text = (text) => {
            return spkMessages.text(text);
        }

        this._createElems();

        this.hide();

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
        this._confirmation_Result = result;
        this._confirmation.hide();
    }

    hideLoading()
    {
        this._loading = false;

        // console.log('Hide', new Error());

        let loadingTimeLeft = 1;
        if (this._loading_Start !== null) {
            loadingTimeLeft = Math.max(this.loading_MinTime - 
                ((new Date()).getTime() - this._loading_Start), 1);
        }

        setTimeout(() => {
            if (this._loading)
                return;

            this._loading_Start = null;
            this._l.$fields.Loading = {
                Show: false,
                Text: '',
            };
        }, loadingTimeLeft);

    }

    hideMessage()
    {
        this._msg.hide();

        this._l.$fields.Message = {
            Image: '',
            Title: '',
            Text: '',
        };

        if (this._msg_Fn !== null) {
            let msgFn = this._msg_Fn;
            this._msg_Fn = null;
            msgFn();
        }
    }

    showConfirmation(title, text, yesText, noText, fn = null)
    {
        js0.args(arguments, 'string', 'string', 'string', 'string', 
                [ js0.Default, js0.Null, 'function' ])

        this._confirmation_Fn = fn;

        this._l.$fields.Confirmation = {
            Title: title,
            Text: text,
            Yes: yesText,
            No: noText,
        };

        this._confirmation.show();
    }

    async showConfirmation_Async(title, text, yesText, noText)
    {
        js0.args(arguments, 'string', 'string', 'string', 'string');

        return new Promise((resolve) => {
            this.showConfirmation(title, text, yesText, noText, (result) => {
                resolve(result);
            });
        });
    }

    showLoading(text = '', instant = false)
    {
        js0.args(arguments, [ 'string', js0.Default ],
                [ 'boolean', js0.Default ]);

        // instant = true;

        // console.log('Show', new Error());

        this._loading = true;
        if (instant) {
            this._loading_Start = (new Date()).getTime();
            this._l.$fields.Loading = {
                Text: text,
                Show: true,
            };

            return;
        }

        let t0 = (new Date()).getTime();
        let checkShowLoading = () => {
            if (!this._loading)
                return;

            let t1 = (new Date()).getTime() - t0;
            if (t1 < this.loading_Timeout) {
                setTimeout(() => {
                    checkShowLoading();
                }, 50);
                return;
            }

            this._loading_Start = (new Date()).getTime();
            this._l.$fields.Loading = {
                Text: text,
                Show: true,
            };
        };
        setTimeout(() => {
            checkShowLoading();
        }, 50);
    }

    showMessage(imageSrc, title = '', text = '', fn = null)
    {
        js0.args(arguments, 'string', [ 'string', js0.Default ], 
                [ 'string', js0.Default, ], [ 'function', js0.Null, js0.Default ]);

        if (spkMessages.debug)
            console.log('spkMessages.showMessage', new Error());

        this._msg_Fn = fn;
        this._enabled = false;

        this._l.$fields.Message = {
            Image: imageSrc,
            Title: title,
            Text: text,
        };

        this._msg.show();
    }

    async showMessage_Async(imageSrc, title = '', text = '')
    {
        js0.args(arguments, 'string', [ 'string', js0.Default ], 
            [ 'string', js0.Default, ]);

        return new Promise((resolve) => {
            this.showMessage(imageSrc, title, text, () => {
                resolve();
            });
        });
    }

    showMessage_Failure(title = '', text = '', fn = null)
    {
        js0.args(arguments, [ 'string', js0.Default, ], [ 'string', js0.Default, ], 
                [ 'function', js0.Null, js0.Default ]);

        this.showMessage(this._images.failure, title, text, fn);
    }

    showMessage_Failure_Async(title = '', text = '')
    {
        js0.args(arguments, [ 'string', js0.Default, ], 
                [ 'string', js0.Default, ]);

        return new Promise((resolve) => {
            this.showMessage_Failure(title, text, () => {
                resolve();
            });
        });
    }

    showMessage_Success(title = '', text = '', fn = null)
    {
        js0.args(arguments, [ 'string', js0.Default, ], [ 'string', js0.Default, ], 
                [ 'function', js0.Null, js0.Default ]);

        this.showMessage(this._images.success, title, text, fn);
    }

    showMessage_Success_Async(title = '', text = '')
    {
        js0.args(arguments, [ 'string', js0.Default, ], 
                [ 'string', js0.Default, ]);

        return new Promise((resolve) => {
            this.showMessage_Success(title, text, () => {
                resolve();
            });
        });
    }

    showNotification(message, faIcon = null)
    {
        this._l.$fields.Notification = {
            FaIcon: faIcon === null ? 'fa-info' : faIcon,
            Message: message,
        };

        $(this._l.$elems.Notification).fadeIn(() => {
            setTimeout(() => {
                $(this._l.$elems.Notification).fadeOut(() => {
                    this._l.$fields.Notification = {
                        FaIcon: '',
                        Message: '',
                    };
                });
            }, 1500);
        });
    }

    _createElems()
    {
        this._msg = new bootstrap.Modal(this._l.$elems.Message, {
            backdrop: 'static',
            keyboard: false,
        });
        this._confirmation = new bootstrap.Modal(this._l.$elems.Confirmation, {
            backdrop: 'static',
            keyboard: false,
        });
        this._l.$elems.Confirmation.addEventListener('hidden.bs.modal', (e) => {
            this._l.$fields.Confirmation = {
                Title: '',
                Text: '',
                Yes: '',
                No: '',
            };

            if (this._confirmation_Fn !== null)
                this._confirmation_Fn(this._confirmation_Result);

            this._confirmation_Fn = null;
            this._confirmation_Result = null;
        });

        // this._l.$elems.msg.addEventListener('click', (evt) => {
        //     evt.preventDefault();
        //     this.hideMessage();
        // });

        this._l.$elems.Message.addEventListener('click', (evt) => {
            evt.preventDefault();

            if (evt.target !== this._l.$elems.Message)
                return;

            this.hideMessage();
        });

        this._l.$elems.Message_Close.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.hideMessage();
        });

        this._l.$elems.Message_Confirm.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.hideMessage();
        });

        this._l.$elems.Confirmation_Close.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.hideConfirmation(false);
        });
        
        this._l.$elems.Confirmation_Yes.addEventListener('click', (evt) => {
            evt.preventDefault();

            this.hideConfirmation(true);
        });

        this._l.$elems.Confirmation_No.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.hideConfirmation(false);
        });
    }

}