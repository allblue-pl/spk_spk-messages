'use strict';

const
    spocky = require('spocky')
;

export default class Messages extends spocky.Layout {

    static get Content() {
        return [["div",{"_show":["message.show"],"_elem":["message"],"class":["abn_message_holder"]},["div",{"class":["abn_message_placer"]},["div",{"class":["abn_message_content"]},["img",{"_show":["message.image"],"src":["$message.image"],"class":[""]}],["div",{"class":["mg-clear"]}],["div",{"class":[""]},["p",{},"$message.text"]]]]],["div",{"_show":["loading.show"],"class":["abn_message_holder"]},["div",{"class":["abn_message_placer"]},["div",{"class":["abn_message_content"]},["img",{"class":[""],"src":["$loading.image"]}],["div",{"class":["mg-clear"]}],["div",{"class":[""]},["p",{},"$loading.text"]]]]],["div",{"_show":["confirmation.show"],"class":["abn_message_holder"]},["div",{"class":["abn_message_placer"]},["div",{"class":["abn_message_content abn_message_background"]},["p",{"class":["lead text-center"]},"$confirmation.text"],["div",{"class":["row"]},["div",{"class":["col-sm-6 mb-3"]},["a",{"_elem":["yes"],"class":["btn btn-success w-100 text-white"]},["i",{"class":["fa fa-check i-left"]}],"$confirmation.yes"]],["div",{"class":["col-sm-6 mb-3"]},["a",{"_elem":["no"],"class":["btn btn-danger w-100 text-white"]},["i",{"class":["fa fa-times i-left"]}],"$confirmation.no"]]]]]]];
    }


    constructor()
    {
        super(Messages.Content);
    }

}
