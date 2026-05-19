import {
    useReadReviewsApiV1ReviewsGet,
} from "./reviews"
import { ReadReviewsApiV1ReviewsGetParams } from "../model";

export const useReviewActions = (params?: ReadReviewsApiV1ReviewsGetParams) => {
    const { data, isLoading, isError } = useReadReviewsApiV1ReviewsGet(params);


    return {
        reviews: data?.data ?? [],
        isLoading,
        error: isError,
        total: data?.count
    };


}
