import { CancelableResponse } from "./CancelableResponse";
import { Future, FutureData } from "./Future";

export function toFuture<Data>(res: CancelableResponse<Data>): FutureData<Data> {
    return Future.fromComputation((resolve, reject) => {
        res.getData()
            .then(resolve)
            .catch(err => reject(err ? err.message : "Unknown error"));
        return res.cancel;
    });
}
