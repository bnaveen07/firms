import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

const PageWrapper = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-wrapper">{children}</main>
      </div>
    </div>
  );
};

export default PageWrapper;
