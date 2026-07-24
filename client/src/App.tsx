import { Switch, Route, Router as WouterRouter } from "wouter";
import { useCallback, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import CataloguePage from "@/pages/CataloguePage";
import ProductPage from "@/pages/ProductPage";
import BrandsPage from "@/pages/BrandsPage";
import AboutPage from "@/pages/AboutPage";
import CartPage from "@/pages/CartPage";
import SommelierPage from "@/pages/SommelierPage";
import NotFound from "@/pages/not-found";
import { CartProvider } from "@/components/CartContext";
import { AuthProvider } from "@/components/AuthContext";
import MemberPage from "@/pages/MemberPage";
import FineRarePage from "@/pages/FineRarePage";
import PromotionPage from "@/pages/PromotionPage";
import TermsPage from "@/pages/TermsPage";
import BrandDetailPage from "@/pages/BrandDetailPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import OccasionPage from "@/pages/OccasionPage";
import PaymentResultPage from "@/pages/PaymentResultPage";
import NewArrivalsPage from "@/pages/NewArrivalsPage";
import AdminPage from "@/pages/AdminPage";

// History API routing hook — replaces hash routing for SEO.
// Strips query string from path so wouter matches routes correctly.
function useHistoryLocation(): [string, (to: string) => void] {
  const getCleanPath = () => window.location.pathname.split("?")[0] || "/";
  const [loc, setLoc] = useState(getCleanPath);

  useEffect(() => {
    const onPop = () => { setLoc(getCleanPath()); window.scrollTo({ top: 0, behavior: "instant" }); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    const path = to.split("?")[0];
    window.history.pushState(null, "", path);
    setLoc(path);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return [loc, navigate];
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WouterRouter hook={useHistoryLocation}>
            <Switch>
              {/* Admin — no layout wrapper */}
              <Route path="/admin" component={AdminPage} />
              {/* All other pages — wrapped in Layout */}
              <Route>
                <Layout>
                  <Switch>
                    <Route path="/" component={HomePage} />
                    <Route path="/wines" component={CataloguePage} />
                    <Route path="/wines/:id" component={ProductPage} />
                    <Route path="/brands" component={BrandsPage} />
                    <Route path="/brands/:brand" component={BrandDetailPage} />
                    <Route path="/about" component={AboutPage} />
                    <Route path="/cart" component={CartPage} />
                    <Route path="/sommelier" component={SommelierPage} />
                    <Route path="/member" component={MemberPage} />
                    <Route path="/fine-rare" component={FineRarePage} />
                    <Route path="/promotions/:id" component={PromotionPage} />
                    <Route path="/promotions" component={PromotionPage} />
                    <Route path="/terms" component={TermsPage} />
                    <Route path="/reset-password" component={ResetPasswordPage} />
                    <Route path="/occasion" component={OccasionPage} />
                    <Route path="/new-arrivals" component={NewArrivalsPage} />
                    <Route path="/payment-result" component={PaymentResultPage} />
                    <Route component={NotFound} />
                  </Switch>
                </Layout>
              </Route>
            </Switch>
          </WouterRouter>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
