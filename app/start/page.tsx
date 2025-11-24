"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import { useRouter } from "next/navigation";
import data from "../../data/data.json";
import PageLayout from "@/components/PageLayout";

interface Subcategory {
  id: string;
  name: string;
  reward: number;
  fee: number;
  iconpath: string;
  questions: object[];
}

interface Category {
  id: string;
  name: string;
  iconpath: string;
  subcategories: Subcategory[];
}

// Utility functions for coin balance
const getCoinBalance = (): number => {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("coinBalance") || "0");
};

const Page = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [coinBalance, setCoinBalance] = useState<number>(200);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [dailyBonus, setDailyBonus] = useState({ claimed: false, streak: 0 });
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);

  useEffect(() => {
    // Initialize coin balance from localStorage
    const balance = getCoinBalance();
    setCoinBalance(balance);

    // Check daily bonus status
    const today = new Date().toDateString();
    const lastClaim = localStorage.getItem('lastBonusClaim');
    const streak = parseInt(localStorage.getItem('bonusStreak') || '0');
    
    if (lastClaim === today) {
      setDailyBonus({ claimed: true, streak });
    } else {
      setDailyBonus({ claimed: false, streak });
    }

    // Start animation on mount
    setIsAnimating(true);
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Animation duration

    // Cleanup on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      // Process the data to ensure all image paths are correct
      const processedData = data.map((category: Category) => ({
        ...category,
        iconpath: category.iconpath.startsWith("/")
          ? category.iconpath
          : `/${category.iconpath}`,
        subcategories: category.subcategories.map((subcat: Subcategory) => ({
          ...subcat,
          iconpath: subcat.iconpath?.startsWith("/")
            ? subcat.iconpath
            : `/${subcat.iconpath || "images/default-icon.webp"}`,
        })),
      }));

      setCategories(processedData);
      if (processedData.length > 0) {
        setSelectedCategory(processedData[0]);
      }
    } catch (error) {
      console.error("Error processing data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleCategoryClick = (category: Category | null = null) => {
    setSelectedCategory(category);
  
    // Scroll to the selected category
    const container = document.querySelector(".categories-container");
    if (!category) return; // Exit early if no category is provided

    const categoryElement = document.querySelector(
      `[data-category-id="${category.id}"]`
    );

    if (container && categoryElement) {
      const containerWidth = container.clientWidth;
      const categoryRect = categoryElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const scrollLeft = container.scrollLeft;
      const categoryLeft = categoryRect.left - containerRect.left + scrollLeft;
      const categoryWidth = categoryRect.width;
      const scrollTo = categoryLeft - containerWidth / 2 + categoryWidth / 2;
      container.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  // const handlePlayClick = (
  //   categoryId: string,
  //   subcategoryId: string,
  //   entryFee: number
  // ) => {
  //   // Navigate to quiz page without deducting coins here
  //   // Coins will be deducted when starting the quiz from the quiz page
  //   router.push(
  //     `/quiz?category=${categoryId}&subcategory=${subcategoryId}&fee=${entryFee}`
  //   );
  // };

  const handlePlayClick = (
    categoryId: string,
    subcategoryId: string,
    entryFee: number
  ) => {
    if (coinBalance < entryFee) {
      // Show insufficient coins modal
      setShowInsufficientCoinsModal(true);
    } else {
    router.push(
      `/quiz?category=${categoryId}&subcategory=${subcategoryId}&fee=${entryFee}`
    );
  }
  };


   const handleWatchAd = () => {
    setIsWatchingAd(true);
    
    // Simulate ad watching
    setTimeout(() => {
      const newBalance = coinBalance + 100;
      setCoinBalance(newBalance);
      setIsWatchingAd(false);
      setShowInsufficientCoinsModal(false);
      console.log(newBalance)
      localStorage.setItem("coinBalance", newBalance.toString());
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMsg.innerHTML = '🎉 You earned 100 coins!';
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        successMsg.style.transition = 'all 0.5s ease';
        successMsg.style.opacity = '0';
        successMsg.style.transform = 'translateY(-20px)';
        setTimeout(() => successMsg.remove(), 500);
      }, 2000);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading categories...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">No categories available</div>
      </div>
    );
  }

  const claimDailyBonus = () => {
    const today = new Date().toDateString();
    const streak = parseInt(localStorage.getItem('bonusStreak') || '0') + 1;
    const bonusAmount = 100 + (streak * 10); // Base 100 + 10 per streak
    
    const newBalance = coinBalance + bonusAmount;
    setCoinBalance(newBalance);
    localStorage.setItem('coinBalance', newBalance.toString());
    localStorage.setItem('lastBonusClaim', today);
    localStorage.setItem('bonusStreak', streak.toString());
    
    setDailyBonus({ claimed: true, streak });
    
    // Show success message
    alert(`🎉 Daily Bonus Claimed! +${bonusAmount} coins!\n🔥 ${streak} day streak!`);
  };

  return (
    <PageLayout>
    <div className="min-h-screen bg-black relative">
      {/* Animated Daily Bonus Notification */}
      <AnimatePresence>
        {!dailyBonus.claimed && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-2 rounded-full shadow-lg z-40 flex items-center gap-2"
          >
            <motion.span
              animate={{ rotate: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
            >
              🎁
            </motion.span>
            <span className="font-bold">Daily Bonus Available!</span>
            <motion.button 
              onClick={claimDailyBonus}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-2 bg-white text-amber-700 px-3 py-1 rounded-full text-sm font-bold hover:bg-amber-100 transition-colors"
            >
              Claim Now
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
            onClick={handleBack}
          >
            <FaArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#2a291f] flex items-center gap-2 px-3 py-1 rounded-md">
              <Image
                src="/starCoin.avif"
                alt="Coins"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span
                className={`text-[#FDC700] font-bold transition-all duration-1000 ${
                  isAnimating
                    ? "text-2xl text-yellow-300 drop-shadow-[0_0_10px_#FDC700]"
                    : "text-base"
                }`}
              >
                {coinBalance}
              </span>
            </div>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Image
                src="/freeCoins.avif"
                alt="Get Coins"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </button>
          </div>
        </div>
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (coinBalance / 1000) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Level 1</span>
            <span>{coinBalance}/1000 XP</span>
          </div>
          
          <h2 className="text-2xl font-bold text-white">Top Quiz Categories</h2>

          {/* Categories Horizontal Scroll */}
          <div className="relative">
            <div className="categories-container flex space-x-3 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  data-category-id={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`flex-shrink-0 flex flex-col items-center p-2 sm:p-3 rounded-xl transition-colors w-20 sm:w-24 ${
                    selectedCategory?.id === category.id
                      ? "bg-blue-600"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mb-1 sm:mb-2 flex items-center justify-center">
                    <Image
                      src={category.iconpath}
                      alt={category.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-white text-center">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Category Quizzes */}
          {selectedCategory && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">
                {selectedCategory.name} Quizzes
              </h3>
              <div className="space-y-3">
                {selectedCategory.subcategories.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="bg-gray-800 rounded-xl p-4 flex justify-between items-center hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Image
                          src={subcategory.iconpath}
                          alt={subcategory.name}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          {subcategory.name}
                        </h4>

                        <div className="text-xs text-gray-400">
                          Entry: {subcategory.fee} coins
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-400 mb-1">
                          Balance: {coinBalance} coins
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayClick(
                              selectedCategory.id,
                              subcategory.id,
                              subcategory.fee
                            );
                          }}
                          // disabled={coinBalance < subcategory.fee}
                          className={`text-white px-6 py-2 rounded-[20px] font-bold bg-gradient-to-br from-white from-5% via-[#0062ff] to-[#3779FF] hover:from-10% hover:via-[#2a5fd6] hover:to-[#2a5fd6] transition-all duration-300 relative overflow-hidden`}
                        >
                          Play
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Animated Watch Ad Modal */}
      <AnimatePresence mode="wait">
        {showAuthModal && (
          <motion.div 
            key="modal"
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              key="modal-content"
              className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-6 w-full max-w-sm relative overflow-hidden"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ 
                type: 'spring', 
                damping: 20, 
                stiffness: 300,
                duration: 0.3
              }}
          >
            <motion.button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes size={24} />
            </motion.button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Get Free Coins! 🎁
              </h2>
              <p className="text-gray-400">
                Watch a short video to earn 50 coins
              </p>
            </div>
            
            <div className="space-y-4">
              <motion.div 
                className="relative bg-[#0f3460] rounded-xl p-4 text-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div 
                  className="w-20 h-20 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center text-3xl"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: 'reverse',
                    duration: 2 
                  }}
                >
                  🎥
                </motion.div>
                <p className="text-white font-medium">30 Second Ad</p>
                <p className="text-yellow-400 text-sm mt-1">+50 Coins Reward</p>
              </motion.div>
              
              <div className="flex gap-3">
                <motion.button 
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Maybe Later
                </motion.button>
                <motion.button 
                  onClick={() => {
                    setIsWatchingAd(true);
                    // Simulate ad watching
                    setTimeout(() => {
                      const newBalance = coinBalance + 50;
                      setCoinBalance(newBalance);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('coinBalance', newBalance.toString());
                      }
                      setIsWatchingAd(false);
                      setShowAuthModal(false);
                      
                      // Create and animate success message
                      const successMsg = document.createElement('div');
                      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                      successMsg.innerHTML = '🎉 You earned 50 coins!';
                      document.body.appendChild(successMsg);
                      
                      // Animate success message
                      setTimeout(() => {
                        successMsg.style.transition = 'all 0.5s ease';
                        successMsg.style.opacity = '0';
                        successMsg.style.transform = 'translateY(-20px)';
                        setTimeout(() => successMsg.remove(), 500);
                      }, 2000);
                    }, 2000);
                  }}
                  disabled={isWatchingAd}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  
                  {isWatchingAd ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Watching...
                    </>
                  ) : (
                    <>
                      <span>Watch Ad</span>
                      <span className="text-yellow-200">+50</span>
                    </>
                  )}
                </motion.button>
              </div>
              
              <p className="text-center text-gray-400 text-sm mt-4">
                Watch daily to earn more coins!
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

       <AnimatePresence mode="wait">
        {showInsufficientCoinsModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowInsufficientCoinsModal(false)}
          >
            <motion.div 
              className="bg-gradient-to-br from-[#2a3a50] to-[#1a2332] rounded-2xl p-6 w-full max-w-sm relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowInsufficientCoinsModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="text-center mb-6">
                <motion.div 
                  className="w-24 h-24 mx-auto mb-4 flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                >
                  <div className="relative">
                    <span className="text-6xl">🪙</span>
                    <span className="text-4xl absolute -right-2 -top-2">💰</span>
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Get Free Coins!
                </h2>
                <p className="text-gray-300 mb-1">
                  {"You don't have enough coins to play this contest"}
                </p>
                <p className="text-gray-400 text-sm">
                  {"Click on video ad to get 100 reward coins"}
                </p>
              </div>
              
              <motion.button 
                onClick={handleWatchAd}
                disabled={isWatchingAd}
                className="w-full bg-gradient-to-r from-[#4a90e2] to-[#357abd] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isWatchingAd ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Watching Ad...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">📺</span>
                    <span>Watch Ad to Earn Coins</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </PageLayout>
    
  );
};

export default Page;
