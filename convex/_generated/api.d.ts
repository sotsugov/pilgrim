/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as engine from "../engine.js";
import type * as engineConstants from "../engineConstants.js";
import type * as engineHelpers from "../engineHelpers.js";
import type * as providers_index from "../providers/index.js";
import type * as providers_openai from "../providers/openai.js";
import type * as providers_types from "../providers/types.js";
import type * as seed from "../seed.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  engine: typeof engine;
  engineConstants: typeof engineConstants;
  engineHelpers: typeof engineHelpers;
  "providers/index": typeof providers_index;
  "providers/openai": typeof providers_openai;
  "providers/types": typeof providers_types;
  seed: typeof seed;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
