"use client"
import React, { useState } from "react";
import GoogleAd from "@/components/GoogleAd";
import { useRouter } from "next/navigation";
import Rules from "@/components/Rules";
import PageLayout from "@/components/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
const Page = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [, setIsAnimating] = useState(false);

  const router = useRouter();

  const data = [{
    question: "Which is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    answer: "Pacific Ocean"
  },
  {
    question: "What is the capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    answer: "Canberra"
  },
];
  const handleAnswer = async (selectedOption: string) => {
    if (showFeedback) return; // Prevent multiple clicks
    
    const correct = selectedOption === data[currentQuestionIndex].answer;
    setSelectedAnswer(selectedOption);
    setIsCorrect(correct);
    setShowFeedback(true);
    setIsAnimating(true);

    // Move to next question after delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsAnimating(false);
    if (currentQuestionIndex < data.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Add a small delay before redirecting to show the final feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/earnCoin');
    }
  };

  const getButtonClass = (option: string) => {
    const classes = [
      "w-[150px]",
      "h-[50px]",
      "rounded-[20px]",
      "font-bold",
      "transition-all",
      "duration-300"
    ];  
    
    if (!showFeedback) {
      classes.push(
        "bg-[#181A20]",
        "hover:scale-110",
        "hover:bg-[#34364A]",
        "hover:text-white"
      );
    } else if (option === data[currentQuestionIndex].answer) {
      // Only shake correct answer if a wrong answer was selected
      if (selectedAnswer && !isCorrect) {
        classes.push("bg-green-600", "scale-110", "correct-shake");
      } else {
        classes.push("bg-green-600", "scale-110");
      }
    } else if (option === selectedAnswer && !isCorrect) {
      // Shake wrong answer when selected
      classes.push("bg-red-600", "button-shake");
    } else {
      classes.push("bg-[#181A20]", "opacity-50");
    }
    
    return classes.join(' ');
  };



  return (
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
              adSlot="6012909426"
              className="w-full"
              style={{ minHeight: '90px' }}
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-center">Quick Start!</h1>
          <p className="text-center text-[#4F5663] font-bold">
            Answer {data.length} questions and win upto {data.length * 100} coins.
          </p>
        </motion.div>
        <motion.div 
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-12 relative bg-[#262A35] w-full p-4 rounded-lg"
        >
          {/* header */}
          <motion.div 
            className="w-full h-[35px] flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            <div className="w-[130px] h-[40px] p-1 bg-[#262A35] rounded-[20px] -mt-16">
              <motion.div 
                className="w-full flex items-center justify-center font-bold h-full bg-[#181A20] rounded-[20px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <p>{currentQuestionIndex + 1}/{data.length} Question</p>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Question */}
          <motion.p 
            className="text-center font-bold text-lg my-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {data[currentQuestionIndex].question}
          </motion.p>
          
          {/* Options */}
          <div className="grid grid-cols-2 gap-4 mt-4 mx-auto w-[320px]">
            {data[currentQuestionIndex].options.slice(0, 2).map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswer(option)}
                className={getButtonClass(option)}
                disabled={showFeedback}
                whileHover={!showFeedback ? { scale: 1.05 } : {}}
                whileTap={!showFeedback ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: 0.2 + (index * 0.1),
                    type: 'spring', 
                    stiffness: 300 
                  }
                }}
              >
                {option}
              </motion.button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 mx-auto w-[320px] mb-4">
            {data[currentQuestionIndex].options.slice(2).map((option, index) => (
              <motion.button
                key={index + 2}
                onClick={() => handleAnswer(option)}
                className={getButtonClass(option)}
                disabled={showFeedback}
                whileHover={!showFeedback ? { scale: 1.05 } : {}}
                whileTap={!showFeedback ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: 0.4 + (index * 0.1),
                    type: 'spring', 
                    stiffness: 300 
                  }
                }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </motion.div>
        {/* Feedback Animation */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className={`mt-4 p-4 rounded-lg text-center font-bold ${
                isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Advertisement */}
        <motion.div 
          className="mt-6 w-full max-w-[500px] mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <GoogleAd 
              adSlot="9085919030"
              className="w-full"
              style={{ minHeight: '250px' }}
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Rules/>
        </motion.div>
      </PageLayout>
  );
};

export default Page;
