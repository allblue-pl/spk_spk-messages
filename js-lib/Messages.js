'use strict';

const
    js0 = require('js0'),
    spocky = require('spocky'),

    spkMessages = require('.'),

    $layouts = require('./$layouts')
;

export default class Messages extends spocky.Module {
    constructor(presets = {}, layout = null) { super();
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
        this._msg_Result_ExtraButton = false;
        this._msg_CloseOnBackgroundClick = true;
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

    getImageUri_Failure() {
        return this._images.success;
    }

    getImageUri_Success() {
        return this._images.failure;
    }

    hide() {
        this.hideConfirmation();
        this.hideLoading();
        this.hideMessage();
    }

    hideConfirmation() {
        this._l.$fields.Confirmation = {
            Image: null,
            Title: '',
            Text: '',
            Yes: '',
            No: '',
        };

        if (this._confirmation_Fn !== null) {
            let fn = this._confirmation_Fn;;
            this._confirmation_Fn = null;

            let result = this._confirmation_Result;
            this._confirmation_Result = false;
            fn(result);

            return;
        }

        this._confirmation_Fn = null;
        this._confirmation_Result = false;
    }

    hideLoading() {
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

    hideMessage() {
        js0.args(arguments, [ 'boolean', js0.Default ]);

        this._l.$fields.Message = {
            Image: '',
            Title: '',
            Text: '',
            ExtraButton_Text: '',
            ExtraButton_Class: '',
        };

        if (this._msg_Result_ExtraButton) {
            if (this._msgs_ExtraButtonFn !== null) {
                let extraButtonFn = this._msgs_ExtraButtonFn;

                this._msg_Result_ExtraButton = false;
                this._msg_Fn = null;
                this._msgs_ExtraButtonFn = null;
                this._msg_CloseOnBackgroundClick = true;

                extraButtonFn();
                return;
            }
        } else if (this._msg_Fn !== null) {
            let msgFn = this._msg_Fn;

            this._msg_Result_ExtraButton = false;
            this._msg_Fn = null;
            this._msgs_ExtraButtonFn = null;
            this._msg_CloseOnBackgroundClick = true;

            msgFn();
            return;
        }

        this._msg_Result_ExtraButton = false;
        this._msg_Fn = null;
        this._msgs_ExtraButtonFn = null;
        this._msg_CloseOnBackgroundClick = true;
    }

    showConfirmation(title, text, yesText, noText, fn = null) {
        js0.args(arguments, 'string', 'string', 'string', 'string', 
                [ js0.Default, js0.Null, 'function' ])

        this._confirmation_Fn = fn;

        this._l.$fields.Confirmation = {
            Image: null,
            Title: title,
            Text: text,
            Yes: yesText,
            No: noText,
        };

        this._confirmation.show();
    }

    showConfirmationWithImage(image, title, text, yesText, noText, fn = null) {
        js0.args(arguments, [ 'string', js0.Null ], 'string', 'string', 'string', 'string', 
                [ js0.Default, js0.Null, 'function' ])

        this._confirmation_Fn = fn;

        this._l.$fields.Confirmation = {
            Image: image,
            Title: title,
            Text: text,
            Yes: yesText,
            No: noText,
        };

        this._confirmation.show();
    }

    async showConfirmation_Async(title, text, yesText, noText) {
        return await this.showConfirmationWithImage_Async(null, title, text, 
                yesText, noText);
    }

    async showConfirmationWithImage_Async(image, title, text, yesText, noText) {
        js0.args(arguments, [ 'string', js0.Null ], 'string', 'string', 'string', 'string');

        return new Promise((resolve) => {
            this.showConfirmationWithImage(image, title, text, yesText, noText, 
                    (result) => {
                resolve(result);
            });
        });
    }

    showLoading(text = '', instant = false) {
        js0.args(arguments, [ 'string', js0.Default ], [ 'boolean', js0.Default ]);

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

    showMessage(title = '', text = '', presets = {}) {
        js0.args(arguments, [ 'string', js0.Default ], [ 'string', js0.Default ],
                [ js0.RawObject, js0.Default ]);
        js0.typeE(presets, js0.Preset({
            image: [ 'string', js0.Null, js0.Default(null) ],  
            afterClose: [ 'function', js0.Null, js0.Default(null) ], 
            extraButton: [ js0.Preset({
                text: [ 'string', js0.Null, js0.Default('') ], 
                class: [ 'string', js0.Default('btn-secondary') ], 
                afterClick: [ 'function', js0.Null, js0.Default(null) ], 
            }), js0.Default({}) ],
            closeOnBackgroundClick: [ 'boolean', js0.Default(true) ],
        }));

        if (spkMessages.debug)
            console.log('spkMessages.showMessage', new Error());

        this._msg_Fn = presets.afterClose;
        this._msgs_ExtraButtonFn = presets.extraButton.afterClick;
        this._msg_CloseOnBackgroundClick = presets.closeOnBackgroundClick;

        this._l.$fields.Message = {
            Image: presets.image,
            Title: title,
            Text: text,
            ExtraButton_Text: presets.extraButton.text,
            ExtraButton_Class: presets.extraButtonClass,
        };

        this._msg.show();
    }

    async showMessage_Async(title = '', text = '', presets = {}) {
        js0.args(arguments, [ 'string', js0.Default ], [ 'string', js0.Default ],
                [ js0.RawObject, js0.Default ]);
        js0.typeE(presets, js0.Preset({
            image: [ 'string', js0.Null, js0.Default(null) ],  
            afterClose: [ 'function', js0.Null, js0.Default(null) ], 
            extraButton: [ js0.Preset({
                text: [ 'string', js0.Null, js0.Default('') ], 
                class: [ 'string', js0.Default('btn-secondary') ], 
                afterClick: [ 'function', js0.Null, js0.Default(null) ], 
            }), js0.Default({}) ],
            closeOnBackgroundClick: [ 'boolean', js0.Default(true) ],
        }));

        return new Promise((resolve) => {
            presets.afterClose = () => { resolve(); };
            let extraButton_AfterClick = presets.afterClick;
            presets.extraButton.afterClick = () => {
                extraButton_AfterClick();
                resolve();
            };

            this.showMessage(title, text, presets);
        });
    }

    showMessage_Failure(title = '', text = '', fn = null) {
        js0.args(arguments, [ 'string', js0.Default, ], [ 'string', js0.Default, ], 
                [ 'function', js0.Null, js0.Default ]);

        this.showMessage(title, text, {
            image: this._images.failure, 
            afterClose: fn,
        });
    }

    showMessage_Failure_Async(title = '', text = '') {
        js0.args(arguments, [ 'string', js0.Default, ], 
                [ 'string', js0.Default, ]);

        return new Promise((resolve) => {
            this.showMessage_Failure(title, text, () => {
                resolve();
            });
        });
    }

    showMessage_Success(title = '', text = '', fn = null) {
        js0.args(arguments, [ 'string', js0.Default, ], [ 'string', js0.Default, ], 
                [ 'function', js0.Null, js0.Default ]);

        this.showMessage(title, text, {
            image: this._images.success, 
            afterClose: fn,
        });
    }

    showMessage_Success_Async(title = '', text = '') {
        js0.args(arguments, [ 'string', js0.Default, ], 
                [ 'string', js0.Default, ]);

        return new Promise((resolve) => {
            this.showMessage_Success(title, text, () => {
                resolve();
            });
        });
    }

    showNotification(message, faIcon = null) {
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

    _createElems() {
        this._msg = new bootstrap.Modal(this._l.$elems.Message, {
            backdrop: 'static',
            keyboard: false,
        });
        this._l.$elems.Message.addEventListener('hidden.bs.modal', (e) => {
            this.hideMessage();
        });
        this._confirmation = new bootstrap.Modal(this._l.$elems.Confirmation, {
            backdrop: 'static',
            keyboard: false,
        });
        this._l.$elems.Confirmation.addEventListener('hidden.bs.modal', (e) => {
            this.hideConfirmation();
        });

        // this._l.$elems.msg.addEventListener('click', (evt) => {
        //     evt.preventDefault();
        //     this.hideMessage();
        // });

        this._l.$elems.Message.addEventListener('click', (evt) => {
            evt.preventDefault();

            if (evt.target !== this._l.$elems.Message)
                return;

            if (!this._msg_CloseOnBackgroundClick)
                return;

            this._msg_Result_ExtraButton = false;
            this._msg.hide();
        });

        this._l.$elems.Message_Close.addEventListener('click', (evt) => {
            evt.preventDefault();
            this._msg_Result_ExtraButton = false;
            this._msg.hide();
        });
        this._l.$elems.Message_Confirm.addEventListener('click', (evt) => {
            evt.preventDefault();
            this._msg_Result_ExtraButton = false;
            this._msg.hide();
        });
        this._l.$elems.Message_ExtraButton.addEventListener('click', (evt) => {
            evt.preventDefault();
            this._msg_Result_ExtraButton = true;
            this._msg.hide();
        });

        this._l.$elems.Confirmation_Close.addEventListener('click', (evt) => {
            evt.preventDefault();
            this._confirmation_Result = null;
            this._confirmation.hide();
        });
        
        this._l.$elems.Confirmation_Yes.addEventListener('click', (evt) => {
            evt.preventDefault();
            this._confirmation_Result = true;
            this._confirmation.hide();
        });

        this._l.$elems.Confirmation_No.addEventListener('click', (evt) => {
            evt.preventDefault();
            this._confirmation_Result = false;
            this._confirmation.hide();
        });
    }

}