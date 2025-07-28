import styles from '../style.css?inline';
import {marked} from "marked";

export const feyscriptToHTML = (feyScript) => `<style>${styles}</style>${marked.parse(feyScript).replace(
    /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi,
    (_, src) => `<fey-image src="${src}"></fey-image>`
)}`

export const feyscriptImageRaplace = (feyScript) => `${marked.parse(feyScript).replace(
    /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi,
    (_, src) => `<fey-image src="${src}"></fey-image>`
)}`
