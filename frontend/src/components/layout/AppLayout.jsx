import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from '../Layout';
import { Toaster } from 'react-hot-toast';

const AppLayout = () => {
  return (
    <Layout>
      <Toaster position="top-center" reverseOrder={false} />
      <Outlet />
    </Layout>
  );
};

export default AppLayout;
