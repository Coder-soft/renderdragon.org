import React, { Suspense, lazy } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import AdminPageSkeleton from '@/components/skeletons/AdminPageSkeleton';

const AdminResourcesManager = lazy(() => import('@/components/admin/AdminResourcesManager'));

const Admin = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 cow-grid-bg">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <AdminPageSkeleton />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const authorizedEmails = ['yamura@duck.com', 'theckie@protonmail.com', 'vovoplaygame3@gmail.com'];
  const isAuthorized = user && authorizedEmails.includes(user.email);

  if (!user || !isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Admin Dashboard - Renderdragon</title>
        <meta name="description" content="Admin dashboard for managing Renderdragon resources and content." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 cow-grid-bg">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <Shield className="h-8 w-8 text-cow-purple" />
              <h1 className="text-4xl md:text-5xl font-vt323">
                Admin Dashboard
              </h1>
            </div>
            
            <Suspense fallback={<AdminPageSkeleton />}>
              <AdminResourcesManager />
            </Suspense>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;