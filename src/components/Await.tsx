import React, { useEffect, useState } from 'react';

type AwaitProps<T> = {
    promise: Promise<T>;
    fallback?: React.ReactNode;
    error?: (err: any) => React.ReactNode;
};

export function Await<T>({ promise, fallback = 'Loading...', error }: AwaitProps<T>) {
    const [state, setState] = useState<React.ReactNode>(fallback);

    useEffect(() => {
        promise
            .then((data) => setState(data as React.ReactNode))
            .catch((err) => setState(error ? error(err) : `Error: ${err.message}`));
    }, [promise, error]);

    return <>{state}</>;
}
