import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { CartProvider } from '@/cart/CartProvider';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal/AuthModal';
import { ProfileModal } from '@/components/auth/ProfileModal/ProfileModal';
import { CartDrawer } from '@/components/cart/CartDrawer/CartDrawer';
import { Footer } from '@/components/layout/Footer/Footer';
import { ScrollToTop } from '@/components/routing/ScrollToTop/ScrollToTop';
import { HomePage } from '@/pages/HomePage/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage';
import { AboutPage } from '@/pages/AboutPage/AboutPage';
import { ContactPage } from '@/pages/ContactPage/ContactPage';
import { FaqPage } from '@/pages/FaqPage/FaqPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage/ProductDetailPage';
import { ProductsPage } from '@/pages/ProductsPage/ProductsPage';
import { ReviewsPage } from '@/pages/ReviewsPage/ReviewsPage';
import { AdminPage } from '@/pages/AdminPage/AdminPage';
import { MyOrdersPage } from '@/pages/MyOrdersPage/MyOrdersPage';

function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
      <Footer />
      <CartDrawer />
      <AuthModal />
      <ProfileModal />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'my-orders', element: <MyOrdersPage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <RouterProvider router={router} />
            </CartProvider>
        </AuthProvider>
    );
}


