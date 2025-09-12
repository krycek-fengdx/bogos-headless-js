import { Await, useLoaderData, useRevalidator } from '@remix-run/react';
import { Suspense, useEffect } from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import { Aside } from '~/components/Aside';
import { Footer } from '~/components/Footer';
import { Header, HeaderMenu } from '~/components/Header';
import { CartMain } from '~/components/Cart';
import {
  PredictiveSearchForm,
  PredictiveSearchResults,
} from '~/components/Search';

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/remix"

export type LayoutProps = {
  cart: Promise<CartApiQueryFragment | null>;
  children?: React.ReactNode;
  footer: Promise<FooterQuery>;
  header: HeaderQuery;
  isLoggedIn: boolean;
  env: Env;
};

export function Layout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  env,
}: LayoutProps) {
  return (
    <>
      <CartAside cart={cart} env={env} />
      <SearchAside />
      <MobileMenuAside menu={header.menu} />
      <Header header={header} cart={cart} isLoggedIn={isLoggedIn} />
      <main>{children}</main>
      <Suspense>
        <Await resolve={footer}>
          {(footer) => <Footer menu={footer.menu} />}
        </Await>
      </Suspense>

      <Analytics />
      <SpeedInsights />
    </>
  );
}

function CartAside({ cart, env }: { cart: LayoutProps['cart']; env: Env }) {
  const loaderData = useLoaderData();
  const revalidator = useRevalidator();

  useEffect(() => {
    const handleRender = () => {
      window.location.hash = 'cart-aside';
      revalidator.revalidate();
    };

    document.addEventListener(
      "fg-gifts:updated",
      handleRender as EventListener
    );

    return () => {
      document.removeEventListener(
        "fg-gifts:updated",
        handleRender as EventListener
      );
    };
  }, [revalidator]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (typeof window.BOGOS === 'undefined') window.BOGOS = {};
      window.BOGOS.customerAccessToken = loaderData?.customerAccessToken?.accessToken;
    }

    setTimeout(() => {
      if (typeof window !== 'undefined' && typeof window.BOGOS_CORE !== 'undefined')
        window.BOGOS_CORE?.helper?.updateCore({
          customer: loaderData?.customerAccessToken?.accessToken
        });
    }, 500);
  }, [loaderData?.customerAccessToken]);

  return (
    <Aside id="cart-aside" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return (
              <>
                <CartMain cart={cart} layout="aside" />
              </>
            );
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  return (
    <Aside id="search-aside" heading="SEARCH">
      <div className="predictive-search">
        <br />
        <PredictiveSearchForm>
          {({ fetchResults, inputRef }) => (
            <div>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
              />
              &nbsp;
              <button type="submit">Search</button>
            </div>
          )}
        </PredictiveSearchForm>
        <PredictiveSearchResults />
      </div>
    </Aside>
  );
}

function MobileMenuAside({ menu }: { menu: HeaderQuery['menu'] }) {
  return (
    <Aside id="mobile-menu-aside" heading="MENU">
      <HeaderMenu menu={menu} viewport="mobile" />
    </Aside>
  );
}
