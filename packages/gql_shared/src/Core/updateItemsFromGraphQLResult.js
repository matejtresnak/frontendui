import { ItemActions } from "../Store";
import { createFetchQuery } from "./createFetchQuery";

/**
 * Creates a dispatchable async action from a GraphQL query.
 * Supports chaining multiple middleware-like functions for post-fetch processing.
 * @function
 * @param {string} query - The GraphQL query string. Must be a valid, non-empty string.
 * @param {object|Function} [params=updateItemsFromGraphQLResult] - Additional parameters for the query (e.g., headers), 
 * or a middleware function. If it is a middleware function, it is added to the middleware chain.
 * @param {...Function} middlewares - Additional middleware functions to process the result.
 * Each middleware must be a function that returns a higher-order function `(result) => (dispatch, getState) => next(result)`.
 *
 * @see processVectorAttributeFromGraphQLResult
 * @see updateItemsFromGraphQLResult
 * 
 * @returns {Function} A dispatchable async action that processes the GraphQL query, applies middleware, and dispatches the result.
 *
 * @throws {Error} If `query` is not a string.
 * @throws {Error} If any of the middlewares are not functions.
 * @throws {Error} If the `query_variables` provided to the resulting action are not a valid JSON object.
 *
 * @example
 * const exampleQuery = `
 *   query ExampleQuery($id: ID!) {
 *     user(id: $id) {
 *       id
 *       name
 *       groups {
 *          __typename
 *          id
 *          name
 *       }
 *     }
 *   }
 * `;
 *
  * // Create an async action
 * const fetchAction = createAsyncGraphQLAction(
 *   exampleQuery,
 *   processVectorAttributeFromGraphQLResult("groups"),
 *   updateItemsFromGraphQLResult
 * );
 *
 * // Dispatch the action with query variables
 * dispatch(fetchAction({ id: "12345" }));
 */
export const updateItemsFromGraphQLResult_01 = (jsonResult) => (dispatch, /*getState */) => (next) => {
    const data = jsonResult?.data;

    if (!data) {
        console.warn("GQLQueryAfterFetch: No data found in jsonResult", jsonResult);
        return jsonResult;
    }

    let result = data?.result;

    // Check if `data` has exactly one key and use it as the result
    if (!result && Object.keys(data).length === 1) {
        const singleKey = Object.keys(data)[0];
        result = data[singleKey];
    }

    if (result) {
        if (Array.isArray(result)) {
            result.forEach((item) => {
                dispatch(ItemActions.item_update(item));
            });
        } else {
            dispatch(ItemActions.item_update(result));
        }
    } else {
        if (Object.keys(data).length === 1) {
            console.warn("GQLQueryAfterFetch: result is null", jsonResult);
        } else {
            console.warn("GQLQueryAfterFetch: No valid result found in data", jsonResult);
        }
        
    }

    return next(jsonResult);
};







/**
 * Processes a GraphQL result and dispatches Redux actions for each item in the result.
 * This function can be used as a middleware in a chain and supports asynchronous behavior.
 *
 * @param {object} jsonData - The JSON result from a GraphQL query.
 * @param {object} jsonData.data - The `data` field containing the query result.
 *
 * @returns {Function} A middleware function that:
 *  - Takes `dispatch`, `getState`, and an optional `next` function.
 *  - Dispatches Redux actions for items in `data.result`.
 *  - Calls the `next` function with the processed `jsonData`.
 *
 * @example
 * // Example usage as a standalone middleware
 * const middleware = updateItemsFromGraphQLResult2(queryResult);
 * middleware(dispatch, getState, (jsonResult) => console.log("Next middleware:", jsonResult));
 *
 * // Example usage in action chaining
 * const query = `
 *   query GetUser($id: ID!) {
 *     user(id: $id) {
 *       id
 *       name
 *     }
 *   }
 * `;
 *
 * const getPostsAction = createAsyncGraphQLAction2(query2, logMiddleware, transformMiddleware);
 * const getUserAndPostsAction = createAsyncGraphQLAction2(query, updateItemsFromGraphQLResult2, getPostsAction);
 * dispatch(getUserAndPostsAction({ id: "12345" }));
 */
export const updateItemsFromGraphQLResult_02 = (jsonData) => async (dispatch, getState, next = (jsonResult) => jsonResult) => {
    const data = jsonData?.data;

    if (!data) {
        console.warn("GQLQueryAfterFetch: No data found in jsonResult", jsonData);
        return next(jsonData);
    }

    let result = data?.result;

    // Check if `data` has exactly one key and use it as the result
    if (!result && Object.keys(data).length === 1) {
        const singleKey = Object.keys(data)[0];
        result = data[singleKey];
    }

    if (result) {
        if (Array.isArray(result)) {
            result.forEach((item) => {
                dispatch(ItemActions.item_update(item));
            });
        } else {
            dispatch(ItemActions.item_update(result));
        }
    } else {
        if (Object.keys(data).length === 1) {
            console.warn("GQLQueryAfterFetch: result is null", jsonData);
        } else {
            console.warn("GQLQueryAfterFetch: No valid result found in data", jsonData);
        }
    }

    // Call the next middleware with the processed data
    return next(jsonData);
};


/**Add commentMore actions
 * Redux-thunk kompatibilní asynchronní akce:
 * Rekurzivně dispatchuje item_update pro každý objekt obsahující __typename.
 * Lze omezit maximální hloubku rekurze (root je depth 0).
 *
 * @param {object} obj - Objekt nebo pole s možnými embedded GraphQL entitami.
 * @param {number} [maxDepth=Infinity] - Maximální hloubka rekurze (0 = jen root).
 * @returns {function} Async thunk action pro Redux.
 *
 * @example
 * dispatch(recursiveUpdateFromGraphQL(obj, 3)); // projde do 3 úrovní vnoření
 */
export function recursiveUpdateFromGraphQL(obj, maxDepth = Infinity) {
    return async function thunk(dispatch, getState) {
        function traverse(o, depth) {
            if (depth > maxDepth) return;
            if (o && typeof o === 'object') {
                if ('__typename' in o) {
                    dispatch(ItemActions.item_update(o));
                }
                Object.values(o).forEach(value => {
                    if (value && typeof value === 'object') {
                        if (Array.isArray(value)) {
                            value.forEach(el => traverse(el, depth + 1));
                        } else {
                            traverse(value, depth + 1);
                        }
                    }
                });
            }
        }
        traverse(obj, 0);
    }
}


/**
 * Processes a GraphQL result and dispatches Redux actions for every nested object with `__typename`.
 * Supports both parameterized (maxDepth) and direct (jsonData) usage.
 *
 * Tento middleware lze použít v řetězení asynchronních Redux-thunk akcí (například v createAsyncGraphQLAction2).
 * Recursivně traversuje každý objekt nebo pole ve výsledku a dispatchuje `item_update` pro všechny objekty,
 * které obsahují klíč `__typename`, až do zadané hloubky (maxDepth).
 *
 * @param {number|object} [maxDepthOrJson=Infinity] - Pokud je zadáno číslo, určuje maximální hloubku rekurze
 *   při hledání embedded objektů (0 = pouze kořenový objekt, 1 = kořen + přímí potomci, atd., Infinity = neomezeně).
 *   Pokud je místo čísla předán přímo objekt `jsonData`, middleware jej zpracuje bez nastavení hloubky (implicitně Infinity).
 *
 * @returns {Function} - Middleware funkce, kterou lze použít v řetězci Redux-thunk akcí nebo volat přímo:
 *   - Pokud voláte s číslem:  updateItemsFromGraphQLResultExt(2)(jsonData)(dispatch, getState, next)
 *   - Pokud voláte přímo s jsonData: updateItemsFromGraphQLResultExt(jsonData)(dispatch, getState, next)
 *
 * @example
 * // Example 1: Volání s určením hloubky rekurze
 * const mw = updateItemsFromGraphQLResultExt(2)(queryResult);
 * mw(dispatch, getState, (jsonResult) => console.log("Next:", jsonResult));
 *
 * // Example 2: Přímé volání s jsonData (nekonečná hloubka)
 * updateItemsFromGraphQLResultExt(queryResult)(dispatch, getState, next);
 *
 * // Example 3: Použití v action chainu s createAsyncGraphQLAction2
 * const getAction = createAsyncGraphQLAction2(
 *     query,
 *     updateItemsFromGraphQLResultExt(3), // maxDepth = 3
 *     dalšíMiddleware,
 * );
 * dispatch(getAction({ id: "abc" }));
 */
export const updateItemsFromGraphQLResult = (maxDepth_=Infinity) => {
    let maxDepth = maxDepth_
    const result = (jsonData) => async (dispatch, getState, next = (jsonResult) => jsonResult) => {
        const data = jsonData?.data;

        if (!data) {
            console.warn("GQLQueryAfterFetch: No data found in jsonResult", jsonData);
            return next(jsonData);
        }

        let result = data?.result;

        // Check if `data` has exactly one key and use it as the result
        if (!result && Object.keys(data).length === 1) {
            const singleKey = Object.keys(data)[0];
            result = data[singleKey];
        }

        if (result) {
            if (Array.isArray(result)) {
                result.forEach((item) => dispatch(recursiveUpdateFromGraphQL(item, maxDepth)))
            } else {
                // dispatch(ItemActions.item_update(result));
                dispatch(recursiveUpdateFromGraphQL(result, maxDepth));
            }
        } else {
            if (Object.keys(data).length === 1) {
                console.warn("GQLQueryAfterFetch: result is null", jsonData);
            } else {
                console.warn("GQLQueryAfterFetch: No valid result found in data", jsonData);
            }
        }

        // Call the next middleware with the processed data
        return next(jsonData);
    };

    if (typeof maxDepth_ === 'object' && maxDepth_ !== null) {
        // Bez parametrů, voláno rovnou: updateItemsFromGraphQLResultExt(jsonData)
        maxDepth = 1
        return result(maxDepth_)
    } else {
        return result;
    }    
}