import {renderMDX} from './util/renderMDX';
import {useEffect, useState} from "react";
export default function MDXRenderer({ code, context, resolveImport }) {
    const [renderedContent, setRenderedContent] = useState(null);

    useEffect(() => {
        renderMDX(code, context, resolveImport).then((result) => {
            setRenderedContent(result);
        })
    }, [code]);


    return renderedContent;
}
