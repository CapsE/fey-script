import React, { useEffect, useState } from 'react';

type AwaitProps<T> = {
    promise: Promise<T>;
    fallback?: React.ReactNode;
    error?: (err: any) => React.ReactNode;
};

export function Await<T>({ promise, fallback = 'Loading...' }: AwaitProps<T>) {
    const [state, setState] = useState(fallback);

    useEffect(() => {
        promise.then((data) => setState(data))

    }, [promise]);

    return <>{state}</>;
}
