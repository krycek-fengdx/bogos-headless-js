/// <reference types="@remix-run/dev" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

import type {Storefront, HydrogenCart} from '@shopify/hydrogen';
import type {HydrogenSession} from './server';

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  /**
   * Declare expected Env parameter in fetch handler.
   */
  interface Env {
    SESSION_SECRET: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PRIVATE_STOREFRONT_API_TOKEN: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_ID: string;
    CURRENCY_CODE: string;
    BOGOS_ACCESS_TOKEN: string;
    BOGOS_JS_SDK: string;
    APP_ENV: string;
  }

  interface Window {
    BOGOS: any;
    BOGOS_CORE: {
      helper: {
        updateCore(option: {
          cart?: object;
          customer?: object | string;
          [key: string]: any;
        }): unknown;
        init(
          myshopifyDomain: string,
          bogosKey: string,
          option: {cart?: object; customer?: object | string},
        ): unknown;
        gift: {
          prepareCheckout(): Promise<void>;
          checkItemIsGift(product: object | string): any;
          renderCustomizeForProduct: (
            product: object[] | any[],
            options: {
              collection?: boolean;
              product?: boolean;
              selectedVariants?: {
                id: any;
                product_id: any;
              }[];
            },
          ) => void;
        };
      };
    };
  }
}

/**
 * Declare local additions to `AppLoadContext` to include the session utilities we injected in `server.ts`.
 */
declare module '@shopify/remix-oxygen' {
  export interface AppLoadContext {
    env: Env;
    cart: HydrogenCart;
    storefront: Storefront;
    session: HydrogenSession;
    waitUntil: ExecutionContext['waitUntil'];
  }
}
