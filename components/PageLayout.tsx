import React from 'react';
import GoogleAd from './GoogleAd';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-1">
      {/* Left Sidebar */}
      <div className="w-full xl:block hidden max-w-[300px] fixed top-[100px] md:left-[250px] left-[50px]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4">
          <div className="flex justify-center">
                  <div className="w-full min-h-[250px]">

            <GoogleAd 
              adSlot="6950586571"
            
            />
            </div>
          </div>
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="w-full xl:block hidden max-w-[300px] fixed top-[100px] md:right-[250px] right-[50px]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4">
          <div className="flex justify-center">
                              <div className="w-full min-h-[250px]">

            <GoogleAd 
              adSlot="3578317778"
              
            />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="w-full max-w-[450px] z-10">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
