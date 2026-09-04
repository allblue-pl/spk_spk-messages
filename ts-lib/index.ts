import abText from "ab-text";
import Messages from "./Messages.js";
import lang_PL from "./languages/pl.spk-messages.js";
import lang_EN from "./languages/en.spk-messages.js";

class spkMessages_Class {
    #debug: boolean;


    get Messages(): typeof Messages {
        return Messages
    }


    get debug(): boolean {
        return this.#debug;
    }


    constructor() {
        this.#debug = false;

        abText.add('en.spkMessages', lang_EN);
        abText.add('pl.spkMessages', lang_PL);

        abText.setLang("pl");
    }

    setDebug(debug: boolean): void {
        this.#debug = debug;
    }

    text(text: string): string {
        return abText.$(`spkMessages.${text}`);
    }
}
const spkMessages = new spkMessages_Class();
export default spkMessages;