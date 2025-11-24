"use client";
import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Rules from "@/components/Rules";
import PageLayout from "@/components/PageLayout";
import GoogleAd from "@/components/GoogleAd";
import { motion, AnimatePresence } from "framer-motion";
// Utility function to update coin balance
const updateCoinBalance = (amount: number): number => {
  if (typeof window === "undefined") return 0;
  const currentBalance = parseInt(localStorage.getItem("coinBalance") || "0");
  const newBalance = Math.max(0, currentBalance + amount);
  localStorage.setItem("coinBalance", newBalance.toString());
  return newBalance;
};

const EarnCoinContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Check if reward was already claimed for this session
  useEffect(() => {
    const rewardKey = `reward_claimed_${category}_${subcategory}`;
    const wasClaimed = localStorage.getItem(rewardKey) === "true";
    setRewardClaimed(wasClaimed);
    if (!wasClaimed) {
      updateCoinBalance(200);
      localStorage.setItem(rewardKey, "true");
    }
  }, [category, subcategory]);

  const handlePlayNow = () => {
    router.push("/start");
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <PageLayout>
        {/* Main Content Advertisement */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-[728px] mx-auto"
        >
          <div className="flex justify-center w-full">
            <GoogleAd 
              adSlot="1011987899"
              className="w-full"
              style={{ minHeight: '90px' }}
            />
          </div>
        </motion.div>
        <motion.div 
          className="w-full max-w-[400px] p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.h1 
            className="text-2xl font-bold text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          >
            Quick Start!
          </motion.h1>
          <motion.p 
            className="text-center text-[#4F5663] font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Answer{" "}
            {subcategory ? subcategory.replace(/-/g, " ") : "general knowledge"}{" "}
            questions and win coins!
          </motion.p>
          <motion.div 
            className="mt-12 relative bg-[#262A35] overflow-hidden w-full p-9 rounded-lg"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              type: 'spring',
              stiffness: 100,
              damping: 15,
              delay: 0.5
            }}
          >
            {/* Animated coin image with floating effect */}
            <motion.div 
              className="flex w-full items-center justify-center relative py-4"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.7
                }}
              >
                <Image
                  src="/earnCoinImage.avif"
                  alt="Earn Coins"
                  width={200}
                  height={200}
                  className="relative z-10"
                />
              </motion.div>
              
              <motion.div 
                className="absolute top-1/2 -translate-y-1/2 right-0 w-[200px] h-[200px] flex items-center justify-center"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 0.8 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <Image
                  src="/decorationRight.avif"
                  alt=""
                  width={200}
                  height={200}
                  className="w-auto h-full object-contain"
                />
              </motion.div>
              
              <motion.div 
                className="absolute top-20 -translate-y-1/2 left-0 w-[200px] h-[200px] flex items-center justify-center"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 0.8 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <Image
                  src="/decorationLeft.avif"
                  alt=""
                  width={200}
                  height={200}
                  className="w-auto h-full object-contain"
                />
              </motion.div>
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.p 
                key={rewardClaimed ? 'claimed' : 'not-claimed'}
                className="text-center text-[22px] font-bold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {rewardClaimed
                  ? "You already claimed your reward!"
                  : "You have won 200 coins!"}
              </motion.p>
            </AnimatePresence>
            
            <motion.p 
              className="text-center text-[#4F5663] mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Check out more quizzes to test your skills and keep grabbing more
              coins!
            </motion.p>
            
            <motion.div 
              className="flex w-full items-center justify-center mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                onClick={handlePlayNow}
                className="text-white px-24 py-3 rounded-[20px] font-bold bg-gradient-to-br from-white from-5% via-[#0062ff] to-[#3779FF] hover:from-10% hover:via-[#2a5fd6] hover:to-[#2a5fd6] relative overflow-hidden group"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 10px 25px -5px rgba(0, 98, 255, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                   Win More Coins
                </span>
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div 
          className="w-full max-w-[400px] px-4 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Rules />
        </motion.div>
      </PageLayout>
    </div>
  );
};

const EarnCoinPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <EarnCoinContent />
    </Suspense>
  );
};

export default EarnCoinPage;
