import React, { Suspense } from 'react';
import { BarLoader } from 'react-spinners';

const Layout = ({ children }) => {
  return (
    <div className='px-5'>
      <div className='flex items-center justify-between mb-5'>
        <h1 className="text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text pb-2 pr-2 bg-gradient-to-b from-gray-400 via-gray-200 to-gray-600">
          Industry Insights
        </h1>
      </div>
      <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color='gray' />}>
        {children}
      </Suspense>
    </div>
  );
};

export default Layout;
