import _ from "lodash";
import qs from "qs";
import { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";

export function useQueryState<Obj extends object>(initialState: Obj): ResultType<Obj> {
    const history = useHistory();

    const [state, setState] = useState<Obj>(() => {
        const preloadState = qs.parse(history.location.search, { ignoreQueryPrefix: true });
        return { ...initialState, ...preloadState };
    });

    const updateState = useCallback(
        (update: SetStateAction<Obj>) => {
            setState(prevState => {
                const actualState = _.isFunction(update) ? update(prevState) : update;
                const query = qs.stringify(compactQuery(actualState), { encode: false });

                history.push(`${history.location.pathname}?${query}`);
                return actualState;
            });
        },
        [history]
    );

    return [state, updateState];
}

function compactQuery<T extends object>(query: T) {
    return _(query)
        .toPairs()
        .filter(([, value]) => !!value && (!Array.isArray(value) || value.length > 0))
        .fromPairs()
        .value();
}

type SetStateAction<S> = S | ((prevState: S) => S);
type ResultType<Obj extends object> = [Obj, (state: SetStateAction<Obj>) => void];
