import { ts0, type TS0ValueType } from "@allblue/ts0";

export type ImagesPresets = {
    loading?: string|null,
    success?: string,
    failure?: string,
};
export type ImagesPresets_Parsed = {
    loading: string|null,
    success: string,
    failure: string,
};

export type MessagesPresets = {
    modulePath?: string,
    images?: ImagesPresets,
};

export type ShowMessagePreset = {
    image?: string|null,  
    afterClose?: (() => void)|null, 
    extraButton?: {
        text: string, 
        class?: 'string', 
        afterClick?: (() => void)|null, 
    },
    closeOnBackgroundClick?: boolean,
};
export type ShowMessagePreset_Parsed = {
    image: string|null,  
    afterClose: (() => void)|null, 
    extraButton: {
        text: string, 
        class: 'string', 
        afterClick: (() => void)|null, 
    },
    closeOnBackgroundClick: boolean,
};
export const presets_ShowMessagePreset: TS0ValueType = ts0.TPreset({
    image: [ 'string', ts0.TNull, ts0.TDefault(null) ],  
    afterClose: [ "function", ts0.TNull, ts0.TDefault(null) ], 
    extraButton: [ ts0.TPreset({
        text: [ 'string', ts0.TDefault("") ], 
        class: [ 'string', ts0.TDefault('btn-secondary') ], 
        afterClick: [ 'function', ts0.TNull, ts0.TDefault(null) ], 
    }), ts0.TDefault({}) ],
    closeOnBackgroundClick: [ 'boolean', ts0.TDefault(true) ],
});