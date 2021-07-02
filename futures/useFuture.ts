import { isFunction } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { Future, FutureData } from "./Future";

type Callback = () => void;
type FutureCalculation<Obj> = FutureData<Obj> | (() => FutureData<Obj>);
type ResultType<Obj> = {
    data?: Obj;
    error?: string;
    loading: boolean;
    cancel: Callback;
    refetch: Callback;
};

export function useFuture<Obj>(inputFuture: FutureCalculation<Obj>): ResultType<Obj> {
    const [future] = useState(() => {
        return isFunction(inputFuture) ? inputFuture() : inputFuture;
    });

    const [data, setData] = useState<Obj>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>();
    const [cancel, setCancel] = useState<Callback>(Future.noCancel);

    const refetch = useCallback(() => {
        setData(undefined);
        setLoading(true);
        setError(undefined);
        setCancel(Future.noCancel);

        const cancel = future.run(
            data => {
                setData(data);
                setLoading(false);
            },
            error => {
                setError(error);
            }
        );

        setCancel(() => cancel);
        return cancel;
    }, [future]);

    useEffect(() => {
        return refetch();
    }, [refetch]);

    return { data, loading, cancel, error, refetch };
}
