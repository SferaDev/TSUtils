import _ from "lodash";
import { useCallback, useState } from "react";

type InitialState<S> = S | (() => S | Promise<S>);
type SetStateAction<S> = S | ((prevState: S) => S);
type ResultType<Obj> = [Obj, (state: SetStateAction<Obj>) => void];
type Options = { clear?: boolean };

export function useSessionState<Obj>(
    key: string,
    initialState: InitialState<Obj>,
    options: Options = {}
): ResultType<Obj> {
    const [state, setState] = useState<Obj>(() => {
        const baseState = _.isFunction(initialState) ? initialState() : initialState;

        try {
            const sessionValue = options.clear ? "" : window.sessionStorage.getItem(key) ?? "";
            const preloadState = JSON.parse(sessionValue);
            return { ...baseState, ...preloadState };
        } catch (error) {
            return baseState;
        }
    });

    const updateState = useCallback(
        (update: SetStateAction<Obj>) => {
            setState(prevState => {
                const actualState = _.isFunction(update) ? update(prevState) : update;
                window.sessionStorage.setItem(key, JSON.stringify(actualState));
                return actualState;
            });
        },
        [key]
    );

    return [state, updateState];
}
