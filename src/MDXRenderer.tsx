import {renderMDX} from './util/renderMDX';
import {useEffect, useState} from "react";
export default function MDXRenderer({ code, context }) {
    const [renderedContent, setRenderedContent] = useState(null);

    useEffect(() => {
        renderMDX(code, context).then((result) => {
            setRenderedContent(result);
        })
    }, [code]);


    return renderedContent;
}
