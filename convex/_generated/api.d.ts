/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as guests from "../guests.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_entitlements from "../lib/entitlements.js";
import type * as lib_metro from "../lib/metro.js";
import type * as lib_vendorRank from "../lib/vendorRank.js";
import type * as partyPlans from "../partyPlans.js";
import type * as planGeneration from "../planGeneration.js";
import type * as seed from "../seed.js";
import type * as stripeNode from "../stripeNode.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";
import type * as vendors from "../vendors.js";
import type * as vendorsLive from "../vendorsLive.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  guests: typeof guests;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/entitlements": typeof lib_entitlements;
  "lib/metro": typeof lib_metro;
  "lib/vendorRank": typeof lib_vendorRank;
  partyPlans: typeof partyPlans;
  planGeneration: typeof planGeneration;
  seed: typeof seed;
  stripeNode: typeof stripeNode;
  subscriptions: typeof subscriptions;
  users: typeof users;
  vendors: typeof vendors;
  vendorsLive: typeof vendorsLive;
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
