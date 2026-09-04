import { Layout, Module } from "spocky";
import spkMessages from "./index.ts";
import $layouts from "../$layouts/index.ts";
import { presets_ShowMessagePreset, type ImagesPresets, type ImagesPresets_Parsed, type ShowMessagePreset } from "./ts-types.ts";
import type { MessagesPresets, ShowMessagePreset_Parsed } from "./ts-types.ts";
import ts0, { ts0Assert } from "@allblue/ts0";
/* @ab-ignore */
import $ from "jquery";
/* @ab-ignore */
import * as bootstrap from "bootstrap";
import MessagesLayout from "../$layouts/MessagesLayout.ts";

export default class Messages extends Module {
    static get Notification_DisplayTime(): number {
        return 3000;
    }

    static get Notification_FadeInTime(): number {
        return 300;
    }

    static get Notification_FadeOutTime(): number {
        return 300;
    }


    loading_MinTime: number;
    loading_Timeout: number;

    #loading: boolean;
    #loading_Start: number|null;
    #images: ImagesPresets_Parsed;
    #layout: Layout;
    #msg: bootstrap.Modal;
    #msg_Fn: (() => void)|null;
    #msg_ExtraButtonFn: (() => void)|null;
    #msg_CloseOnBackgroundClick: boolean;
    #msg_Result_ExtraButton: boolean;
    #confirmation: bootstrap.Modal;
    #confirmation_Fn: ((result: boolean) => void)|null;
    #confirmation_Result: boolean|null;
    #notifications: Array<NotficationInfo>;
    


    constructor(presets: MessagesPresets, layout: Layout|null = null) { 
        super();

        if (presets.modulePath === undefined)
            presets.modulePath = "/dev/node_modules/spk-messages/";
        if (presets.images === undefined)
            presets.images = {};
        if (presets.images.loading === undefined)
            presets.images.loading = null;
        if (presets.images.success === undefined)
            presets.images.success = presets.modulePath + 'images/success.png';
        if (presets.images.failure === undefined)
            presets.images.failure = presets.modulePath + 'images/failure.png';

        this.loading_MinTime = 500;
        this.loading_Timeout = 500;

        this.#loading = false;
        this.#loading_Start = null;

        this.#images = presets.images as ImagesPresets_Parsed;

        this.#layout = layout === null ? new MessagesLayout() : layout;

        this.#msg = new bootstrap.Modal(this.#layout.$elems.Message, {
            backdrop: 'static',
            keyboard: false,
        });
        this.#msg_Result_ExtraButton = false;
        this.#msg_CloseOnBackgroundClick = true;
        this.#msg_ExtraButtonFn = null;
        this.#msg_Fn = null;

        this.#confirmation = new bootstrap.Modal(
                this.#layout.$elems.Confirmation, {
            backdrop: 'static',
            keyboard: false,
        });
        this.#confirmation_Fn = null;
        this.#confirmation_Result = null;

        this.#notifications = [];

        // this.#layout.$fields.Loading.Image = this.#images.loading;
        this.#layout.$fields.Text = (text: string) => {
            return spkMessages.text(text);
        }

        this.#createElems();

        this.hide();

        this.$view = this.#layout;
    }

    getImageUri_Failure(): string {
        return this.#images.success;
    }

    getImageUri_Success(): string {
        return this.#images.failure;
    }

    hide(): void {
        this.hideConfirmation();
        this.hideLoading();
        this.hideMessage();
    }

    hideConfirmation(): void {
        this.#layout.$fields.Confirmation = {
            Image: this.#images.success,
            Title: '',
            Text: '',
            Yes: '',
            No: '',
        };

        if (this.#confirmation_Fn !== null) {
            let fn = this.#confirmation_Fn;;
            this.#confirmation_Fn = null;

            let result = this.#confirmation_Result;
            ts0Assert(result !== null, "Confirmation result cannot be null.");

            this.#confirmation_Result = false;
            fn(result);

            return;
        }

        this.#confirmation_Fn = null;
        this.#confirmation_Result = false;
    }

    hideLoading(): void {
        this.#loading = false;

        if (spkMessages.debug)
            console.log('spkMessages.hideLoading', new Error());

        let loadingTimeLeft = 1;
        if (this.#loading_Start !== null) {
            loadingTimeLeft = Math.max(this.loading_MinTime - 
                ((new Date()).getTime() - this.#loading_Start), 1);
        }

        setTimeout(() => {
            if (this.#loading)
                return;

            this.#loading_Start = null;
            this.#layout.$fields.Loading = {
                Show: false,
                Text: '',
            };
        }, loadingTimeLeft);

    }

    hideMessage(): void {
        this.#layout.$fields.Message = {
            Image: this.#images.success,
            Title: '',
            Text: '',
            ExtraButton_Text: '',
            ExtraButton_Class: '',
        };

        if (this.#msg_Result_ExtraButton) {
            if (this.#msg_ExtraButtonFn !== null) {
                let extraButtonFn = this.#msg_ExtraButtonFn;

                this.#msg_Result_ExtraButton = false;
                this.#msg_Fn = null;
                this.#msg_ExtraButtonFn = null;
                this.#msg_CloseOnBackgroundClick = true;

                extraButtonFn();
                return;
            }
        } else if (this.#msg_Fn !== null) {
            let msgFn = this.#msg_Fn;

            this.#msg_Result_ExtraButton = false;
            this.#msg_Fn = null;
            this.#msg_ExtraButtonFn = null;
            this.#msg_CloseOnBackgroundClick = true;

            msgFn();
            return;
        }

        this.#msg_Result_ExtraButton = false;
        this.#msg_Fn = null;
        this.#msg_ExtraButtonFn = null;
        this.#msg_CloseOnBackgroundClick = true;
    }

    showConfirmation(title: string, text: string, yesText: string, noText: string, 
            fn: () => void): void {
        this.#confirmation_Fn = fn;

        this.#layout.$fields.Confirmation = {
            Image: this.#images.success,
            Title: title,
            Text: text,
            Yes: yesText,
            No: noText,
        };

        this.#confirmation.show();
    }

    showConfirmationWithImage(image: string|null, title: string, text: string, 
            yesText: string, noText: string, 
            fn: ((result: boolean) => void)|null = null): void {
        this.#confirmation_Fn = fn;

        this.#layout.$fields.Confirmation = {
            Image: image,
            Title: title,
            Text: text,
            Yes: yesText,
            No: noText,
        };

        this.#confirmation.show();
    }

    showConfirmation_Failure(title: string, text: string, yesText: string, 
            noText: string, fn: (() => void)|null = null): void {
        this.showConfirmationWithImage(this.#images.failure, title, text, 
                yesText, noText, fn);
    }

    async showConfirmation_Async(title: string, text: string, yesText: string, 
            noText: string): Promise<boolean> {
        return await this.showConfirmationWithImage_Async(null, title, text, 
                yesText, noText);
    }

    async showConfirmation_Failure_Async(title: string, text: string, 
            yesText: string, noText: string): Promise<boolean> {
        return await this.showConfirmationWithImage_Async(this.#images.failure, 
                title, text, yesText, noText);
    }

    async showConfirmationWithImage_Async(image: string|null, title: string, 
            text: string, yesText: string, noText: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.showConfirmationWithImage(image, title, text, yesText, noText, 
                    (result: boolean) => {
                resolve(result);
            });
        });
    }

    showLoading(text: string = "", instant: boolean = false): void {
        // instant = true;

        if (spkMessages.debug)
            console.log('spkMessages.showLoading', new Error());

        this.#loading = true;
        if (instant) {
            this.#loading_Start = (new Date()).getTime();
            this.#layout.$fields.Loading = {
                Text: text,
                Show: true,
            };

            return;
        }

        let t0 = (new Date()).getTime();
        let checkShowLoading = () => {
            if (!this.#loading)
                return;

            let t1 = (new Date()).getTime() - t0;
            if (t1 < this.loading_Timeout) {
                setTimeout(() => {
                    checkShowLoading();
                }, 50);
                return;
            }

            this.#loading_Start = (new Date()).getTime();
            this.#layout.$fields.Loading = {
                Text: text,
                Show: true,
            };
        };
        setTimeout(() => {
            checkShowLoading();
        }, 50);
    }

    showLoading_Instant(text = ""): void {
        this.showLoading(text, true);
    }

    showMessage(title: string = '', text: string = '', 
            presets_: ShowMessagePreset = {}): void {
        let presets = ts0.assertType(presets_, presets_ShowMessagePreset) as 
                ShowMessagePreset_Parsed;

        if (spkMessages.debug)
            console.log('spkMessages.showMessage', new Error());

        this.#msg_Fn = presets.afterClose;
        this.#msg_ExtraButtonFn = presets.extraButton.afterClick;
        this.#msg_CloseOnBackgroundClick = presets.closeOnBackgroundClick;

        this.#layout.$fields.Message = {
            Image: presets.image,
            Title: title,
            Text: text,
            ExtraButton_Text: presets.extraButton.text,
            ExtraButton_Class: presets.extraButton.class,
        };

        this.#msg.show();
    }

    showMessage_Async(title: string = '', text: string = '', 
            presets_: ShowMessagePreset = {}): Promise<void> {
        let presets = ts0.assertType(presets_, presets_ShowMessagePreset) as 
                ShowMessagePreset_Parsed;

        return new Promise((resolve) => {
            presets.afterClose = () => { resolve(); };
            let extraButton_AfterClick = presets.extraButton.afterClick;
            presets.extraButton.afterClick = () => {
                if (extraButton_AfterClick !== null)
                    extraButton_AfterClick();

                resolve();
            };

            this.showMessage(title, text, presets);
        });
    }

    showMessage_Failure(title: string = '', text: string = '', 
            fn: (() => void)|null = null): void {
        this.showMessage(title, text, {
            image: this.#images.failure, 
            afterClose: fn,
        });
    }

    showMessage_Failure_Async(title: string = '', text: string = ''): Promise<void> {
        return new Promise((resolve) => {
            this.showMessage_Failure(title, text, () => {
                resolve();
            });
        });
    }

    showMessage_Success(title: string = '', text: string = '', fn: (() => void)|null = null): void {
        this.showMessage(title, text, {
            image: this.#images.success, 
            afterClose: fn,
        });
    }

    showMessage_Success_Async(title: string = '', text: string = ''): Promise<void> {
        return new Promise((resolve) => {
            this.showMessage_Success(title, text, () => {
                resolve();
            });
        });
    }

    showNotification(message: string, color: NotificationColor = "primary", 
            faIcon: string|null = null): void {
        this.#notifications.push({
            color: color,
            faIcon: faIcon,
            message: message,
            start: (new Date).getTime(),
        });
        console.log(this.#notifications);

        if (this.#notifications.length > 1)
            return;
        else {
            let intervalId = setInterval(() => {
                let time = (new Date()).getTime();

                let fNotifications: Array<FNotfication> = [];
                for (let i = this.#notifications.length - 1; i >= 0; i--) {
                    let notification = this.#notifications[i];

                    /* Fade In */
                    let style = "";
                    if (time - Messages.Notification_FadeInTime <= notification.start) {
                        style = "opacity: " + this.#round(
                                (time - notification.start) / Messages.Notification_FadeInTime);
                    } else if (time - Messages.Notification_FadeInTime -
                            Messages.Notification_DisplayTime <= notification.start) {
                        // Do nothing.
                    } else if (time - Messages.Notification_FadeInTime -
                            Messages.Notification_DisplayTime > notification.start &&
                            time - Messages.Notification_FadeInTime -
                            Messages.Notification_DisplayTime - Messages.Notification_FadeOutTime <=
                                    notification.start) {
                        style = "opacity: " + this.#round(
                                (Messages.Notification_FadeOutTime -
                                (time - notification.start - 
                                Messages.Notification_FadeInTime -
                                Messages.Notification_DisplayTime)) / 
                                Messages.Notification_FadeOutTime);
                    } else {
                        this.#notifications.splice(i, 1);
                        continue;
                    }

                    fNotifications.unshift({
                        Color: notification.color,
                        FaIcon: notification.faIcon,
                        Message: notification.message,
                        Style: style,
                    });
                }

                this.#layout.$fields.Notifications = fNotifications;

                if (this.#notifications.length === 0) {
                    clearInterval(intervalId);
                    return;
                }
            }, 25);
        }
    }

    showNotification_Failure(message: string): void {
        this.showNotification(message, "failure", "fa-solid fa-circle-exclamation");
    }

    showNotification_Info(message: string): void {
        this.showNotification(message, "info", "fa-light fa-comment-exclamation");
    }

    showNotification_Success(message: string): void {
        this.showNotification(message, "success", "fa-solid fa-check");
    }


    #createElems(): void {
        this.#layout.$elems.Message.addEventListener('hidden.bs.modal', (evt: Event) => {
            this.hideMessage();
        });
        this.#layout.$elems.Confirmation.addEventListener('hidden.bs.modal', (evt: Event) => {
            this.hideConfirmation();
        });

        // this.#l.$elems.msg.addEventListener('click', (evt: Event) => {
        //     evt.preventDefault();
        //     this.hideMessage();
        // });

        this.#layout.$elems.Message.addEventListener('click', (evt: Event) => {
            evt.preventDefault();

            if (evt.target !== this.#layout.$elems.Message)
                return;

            if (!this.#msg_CloseOnBackgroundClick)
                return;

            this.#msg_Result_ExtraButton = false;
            this.#msg.hide();
        });

        this.#layout.$elems.Message_Close.addEventListener('click', (evt: Event) => {
            evt.preventDefault();
            this.#msg_Result_ExtraButton = false;
            this.#msg.hide();
        });
        this.#layout.$elems.Message_Confirm.addEventListener('click', (evt: Event) => {
            evt.preventDefault();
            this.#msg_Result_ExtraButton = false;
            this.#msg.hide();
        });
        this.#layout.$elems.Message_ExtraButton.addEventListener('click', (evt: Event) => {
            evt.preventDefault();
            this.#msg_Result_ExtraButton = true;
            this.#msg.hide();
        });

        this.#layout.$elems.Confirmation_Close.addEventListener('click', (evt: Event) => {
            evt.preventDefault();
            this.#confirmation_Result = null;
            this.#confirmation.hide();
        });
        
        this.#layout.$elems.Confirmation_Yes.addEventListener('click', (evt: Event) => {
            evt.preventDefault();
            this.#confirmation_Result = true;
            this.#confirmation.hide();
        });

        this.#layout.$elems.Confirmation_No.addEventListener('click', (evt: Event) => {
            evt.preventDefault();
            this.#confirmation_Result = false;
            this.#confirmation.hide();
        });
    }


    #round(nr: number): number {
        return Math.round((nr  +  Number.EPSILON) * 100) / 100;
    }
}

type NotificationColor = "failure"|"info"|"primary"|"success";
type NotficationInfo = {
    color: NotificationColor,
    faIcon: string|null,
    message: string,
    start: number,
};
type FNotfication = {
    Color: NotificationColor,
    FaIcon: string|null,
    Message: string,
    Style: string,
};