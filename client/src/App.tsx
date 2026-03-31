import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useCallback } from "react";
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

// Custom hook: strips query string from hash path so wouter matches routes correctly.
// e.g. #/payment-result?ref=TC-xxx → path is "/payment-result" (query preserved in window.location)
function useHashLocationNoQuery(): [string, (to: string) => void] {
  const [loc, navigate] = useHashLocation();
  // Strip query string from the path (everything after ?)
  const cleanLoc = loc.split("?")[0];
  const stableNavigate = useCallback((to: string) => navigate(to), [navigate]);
  return [cleanLoc, stableNavigate];
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WouterRouter hook={useHashLocationNoQuery}>
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
                <Route path="/payment-result" component={PaymentResultPage} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
          </WouterRouter>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
