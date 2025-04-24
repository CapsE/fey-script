import {observable} from "mobx";

export function getObservable() {
    return observable({
        data: {}
    });
}
