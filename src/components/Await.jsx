import React, { useEffect, useState } from "react"

export function Await({ promise, fallback = "Loading...", error }) {
    const [state, setState] = useState(fallback)

    useEffect(() => {
        promise
            .then(data => setState(data))
            .catch(err => setState(error ? error(err) : `Error: ${err.message}`))
    }, [promise, error])

    return <>{state}</>
}
