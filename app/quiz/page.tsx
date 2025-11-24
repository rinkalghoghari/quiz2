"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { logEvent } from "@/lib/firebaseConfig";

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const CountdownCircleTimer = dynamic(
  () =>
    import("react-countdown-circle-timer").then(
      (mod) => mod.CountdownCircleTimer
    ),
  {
    loading: () => <div className="w-16 h-16 bg-gray-700 rounded-full" />,
    ssr: false,
  }
);

import data from "../../data/data.json";
import Rules from "@/components/Rules";
import ConfettiAnimation from "@/components/ConfettiAnimation";
import GoogleAd from "@/components/GoogleAd";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

// Utility functions for coin balance
const getCoinBalance = (): number => {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("coinBalance") || "200");
};

const updateCoinBalance = (amount: number): number => {
  if (typeof window === "undefined") return 0;
  const newBalance = Math.max(0, amount);
  localStorage.setItem("coinBalance", newBalance.toString());
  return newBalance;
};

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ correct: boolean }[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showTimeoutPopup, setShowTimeoutPopup] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAdvertisement, setShowAdvertisement] = useState(false);
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const entryFee = searchParams.get("fee");
  const currentQuestion = questions[currentQuestionIndex];
  const [currentDuration, setCurrentDuration] = useState(3 * 60 + 20); // 3 minutes 20 seconds 3*60+20
  // const [adWatched, setAdWatched] = useState(false);

  const handleTimeComplete = () => {
    // Always show the timeout popup when time runs out
    setShowTimeoutPopup(true);
    setShowResult(true);

    // Don't restart the timer automatically
    return { shouldRepeat: false };
  };

  const handleWatchAd = () => {
    // Add 2 minutes (120 seconds) to the duration
    setCurrentDuration(prev => prev + 120);
    // setAdWatched(true);
    setShowAdvertisement(true);
    setShowTimeoutPopup(false);
    setShowResult(false); // Re-enable the options

    // Hide the ad after 2 seconds (for demo) or keep it for 2 minutes
    setTimeout(() => {
      setShowAdvertisement(false);
    }, 2000); // 2 seconds for demo, change to 2 * 60 * 1000 for 2 minutes
  };

  const renderTime = ({ remainingTime }: { remainingTime: number }) => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    return (
      <div className="flex flex-col items-center">
        <div className="text-white text-2xl font-bold">
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
      </div>
    );
  };

  // Update coin balance when component mounts
  useEffect(() => {
    const balance = getCoinBalance();
    console.log("Initial coin balance:", balance);
    setCoinBalance(balance);
  }, []);

  // Animation effect for coin balance
  useEffect(() => {
    if (isAnimating) {
      console.log("Coin balance animation triggered");
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);
  const rulesData = [
    "he winners for each quiz will be declared based on the scores they obtain during the participation in the quiz.",
    "You will have overall 03:20 minutes to solve as many as questions from 10 questions in quiz.",
    "There will be 4 options given below each question and one will be the answer for it out of them.",
    "If you answer a question correctly, you get 50 points.",
    "If your answer for a question is wrong, you get -50 points.",
    "If you do not answer a question, you get 0 points.",
    "Each right answer fetches you 50 points.",
    "Each wrong answer gives you -50 points."
  ];
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!category || !subcategory) {
      router.push("/start");
      return;
    }

    try {
      const selectedCategory = data.find((cat) => cat.id === category);
      const selectedSubcategory = selectedCategory?.subcategories?.find(
        (sub) => sub.id === subcategory
      );

      if (selectedSubcategory?.questions?.length) {
        const shuffledQuestions = [...selectedSubcategory.questions]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        setQuestions(shuffledQuestions);
      } else throw new Error("No questions found for the selected subcategory");

      setLoading(false);
    } catch (error) {
      console.error("Error loading quiz:", error);
      router.push("/start");
    }
  }, [category, subcategory, router]);



  const handleOptionSelect = (selectedAnswer: string) => {
    // Prevent multiple selections
    if (selectedOption !== null) return;

    setSelectedOption(selectedAnswer);
    const isAnswerCorrect = selectedAnswer === currentQuestion.correctAnswer;

    // Log the quiz option selection to Firebase Analytics
    logEvent("quiz_option_selected", {
      question_id: currentQuestion.id,
      question_text: currentQuestion.question.substring(0, 100), // Limit length
      selected_option: selectedAnswer.substring(0, 100), // Limit length
      is_correct: isAnswerCorrect,
      category: category || "unknown",
      subcategory: subcategory || "unknown",
      question_number: currentQuestionIndex + 1,
      total_questions: questions.length,
    });

    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    // Update user answers array
    const newUserAnswers = [...userAnswers, { correct: isAnswerCorrect }];
    setUserAnswers(newUserAnswers);

    // Update score based on correct/incorrect answer
    const points = isAnswerCorrect ? 50 : -50;
    const newScore = Math.max(0, score + points);

    // If this is the last question, wait 2 seconds then mark as completed
    if (currentQuestionIndex === questions.length - 1) {
      setScore(newScore);
      // updateUserCoins(newScore);
      const currentBalance = getCoinBalance();
      const updatedBalance = updateCoinBalance(currentBalance + newScore);
      setCoinBalance(updatedBalance);
      setIsAnimating(true);

      // Wait 2 seconds before showing completion screen
      setTimeout(() => {
        setQuizCompleted(true);
      }, 1000);

      return;
    }

    // For non-last questions, update score and move to next question
    setScore(newScore);

    // Move to next question after a delay
    setTimeout(() => {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    }, 1500);
  };

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] text-white">
        {/* Coin Balance Display */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-[#2a291f] flex items-center gap-2 px-3 py-1 rounded-md border border-yellow-600">
              <Image
                src="/starCoin.avif"
                alt="Coins"
                width={24}
                height={24}
                className="w-6 h-6"
                unoptimized
              />
              <span
                className={`text-[#FDC700] font-bold transition-all duration-1000 ${isAnimating
                    ? "text-2xl text-yellow-300 drop-shadow-[0_0_10px_#FDC700]"
                    : "text-base"
                  }`}
              >
                {coinBalance}
              </span>
            </div>
            <button className="p-1">
              <Image
                src="/freeCoins.avif"
                alt="Get Coins"
                width={32}
                height={32}
                className="w-8 h-8"
                unoptimized
              />
            </button>
          </div>
        </div>
        9
        <div className="flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  const getOptionStyle = (option: string) => {
    const baseClasses = "p-4 text-white rounded-lg transition-all duration-300";

    if (!showResult) return `${baseClasses} bg-[#1E2029] hover:bg-[#2A2D3A]`;
    if (option === currentQuestion.correctAnswer) {
      return `${baseClasses} bg-green-600 scale-110 ${selectedOption && !isCorrect ? "animate-shake" : ""
        }`;
    }
    if (option === selectedOption)
      return `${baseClasses} bg-red-600 animate-shake`;
    return `${baseClasses} bg-[#1E2029] opacity-50`;
  };

  // Debug logging

  // Quiz completion screen
  if (
    (currentQuestionIndex >= questions.length || quizCompleted) &&
    questions.length > 0
  ) {
    const correctAnswers = userAnswers.filter((a) => a.correct).length;
    const totalQuestions = questions.length;
    const finalScore = score;

    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
        <ConfettiAnimation />
        <div className="w-full max-w-md bg-[#262A35] rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-[#FFD700] mb-4">
            Quiz Completed! 🎉
          </h1>
          <div className="bg-[#1E2029] p-6 rounded-xl mb-6">
            <div className="text-5xl font-bold text-white mb-2">
              {finalScore}
            </div>
            <div className="text-[#B9B9B9]">Your Score</div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-[#2A2D3A] p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-500">
                  {correctAnswers}
                </div>
                <div className="text-sm text-[#B9B9B9]">Correct</div>
              </div>
              <div className="bg-[#2A2D3A] p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-500">
                  {totalQuestions - correctAnswers}
                </div>
                <div className="text-sm text-[#B9B9B9]">Incorrect</div>
              </div>
            </div>

            <div className="mt-6 bg-[#2A2D3A] p-4 rounded-lg">
              <div className="text-2xl font-bold text-[#FFD700]">
                +{finalScore} Coins
              </div>
              <div className="text-sm text-[#B9B9B9]">
                Added to your balance
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/start")}
            className="w-full bg-[#4A6CF7] hover:bg-[#3A5CE5] text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="flex items-center flex-col justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative bg-[#262A35] overflow-hidden w-full p-8 rounded-2xl">
            <div className="flex justify-end mb-5">
              <div className="flex items-center ">
                <div className="bg-[#2a291f] flex items-center gap-2 px-3 py-1 rounded-md border border-yellow-600">
                  <Image
                    src="/starCoin.avif"
                    alt="Coins"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                    unoptimized
                  />
                  <span
                    className={`text-[#FDC700] font-bold transition-all duration-1000 ${isAnimating
                        ? "text-2xl text-yellow-300 drop-shadow-[0_0_10px_#FDC700]"
                        : "text-base"
                      }`}
                  >
                    {coinBalance}
                  </span>
                </div>
                <button className="p-1">
                  <Image
                    src="/freeCoins.avif"
                    alt="Get Coins"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                    unoptimized
                  />
                </button>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-6">
              Play & Win 500
            </h1>

            <div className="space-y-6">
              <div className="bg-[#1E2029] p-4 rounded-lg">
                <p className="text-[#B9B9B9] text-center">
                  You&apos;ve got{" "}
                  <span className="text-[#FFD700] font-bold">03:20</span>{" "}
                  minutes to answer all questions.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-[#B9B9B9] text-center">
                  Answer as many questions as you can.
                </p>

                <div className="bg-[#2A2D3A] p-4 rounded-lg text-center">
                  <p className="text-[#B9B9B9]">Entry fee will be</p>
                  <p className="text-2xl font-bold text-[#FFD700]">
                    {entryFee || "0"} coins
                  </p>
                </div>
              </div>

              <button
                className="w-full bg-[#4A6CF7] hover:bg-[#3A5CE5] text-white font-bold py-4 px-6 rounded-lg transition-colors"
                onClick={() => {
                  const currentBalance = getCoinBalance();
                  const entryFeeNumber = parseInt(entryFee || "0");

                  if (currentBalance >= entryFeeNumber) {
                    const newBalance = updateCoinBalance(currentBalance - entryFeeNumber);
                    setCoinBalance(newBalance);
                    setIsAnimating(true);
                    setQuizStarted(true);
                  } else {
                    alert("Not enough coins to start the quiz!");
                    router.push("/earnCoin");
                  }
                }}
              >
                Start Quiz - {entryFee || "0"} Coins
              </button>
            </div>
          </div>
        </div>

        {/* Ad before Rules */}
        <div className="my-6 w-full max-w-[500px] mx-auto">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <GoogleAd
              adSlot="7170202137"
            
            />
          </div>
        </div>

        <Rules rulesData={rulesData} />

        {/* Ad after Rules */}
        <div className="my-6 w-full max-w-[500px] mx-auto">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <GoogleAd
              adSlot="4324423230"
            
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>

      <div className="w-full max-w-md relative mx-auto pt-24">
        {/* Coin Balance Display */}
        <div className="absolute top-4 right-0 z-50 bg-[#1a1a2e] p-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-[#2a291f] flex items-center gap-2 px-3 py-1 rounded-md border border-yellow-600">
              <Image
                src="/starCoin.avif"
                alt="Coins"
                width={24}
                height={24}
                className="w-6 h-6"
                unoptimized
              />
              <span
                className={`text-[#FDC700] font-bold transition-all duration-1000 ${isAnimating
                    ? "text-2xl text-yellow-300 drop-shadow-[0_0_10px_#FDC700]"
                    : "text-base  "
                  }`}
              >
                {coinBalance}
              </span>
            </div>
            <button className="p-1">
              <Image
                src="/freeCoins.avif"
                alt="Get Coins"
                width={32}
                height={32}
                className="w-8 h-8"
                unoptimized
              />
            </button>
          </div>
        </div>

        {/* Score and Timer */}
        <div className="flex justify-between items-center mb-6">
          <div className="w-24 h-24 flex flex-col items-center justify-center p-2 text-sm bg-[#262A35] rounded-xl">
            <p className="text-center text-[#b6b6b6]">Your Score</p>
            <p className="text-center font-bold text-xl">{score}</p>
          </div>

          <div className="w-24 h-24 flex items-center justify-center">
            <CountdownCircleTimer
              isPlaying={true}
              duration={currentDuration}
              colors={["#0062ff", "#3779FF"]}
              colorsTime={[currentDuration, 0]}
              size={80}
              strokeWidth={6}
              onComplete={handleTimeComplete}
            >
              {renderTime}
            </CountdownCircleTimer>
          </div>
        </div>

        {/* Question */}
        <div className="relative bg-[#262A35] w-full p-6 rounded-2xl">
          <div className="mb-8">
            <h3 className="text-lg text-white font-medium mb-6 text-center">
              <div className="w-full flex flex-col items-center p-1 -mt-12 space-y-2">
                <div className="w-[130px] h-[40px] p-1 text-sm bg-[#262A35] rounded-[20px]">
                  <div className="w-full flex items-center justify-center font-bold h-full bg-[#181A20] rounded-[20px]">
                    <p>
                      {currentQuestionIndex + 1}/{questions.length} Question
                    </p>
                  </div>
                </div>
                <div className="flex justify-between space-x-8 w-full">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">
                    {userAnswers.filter((a) => a.correct).length}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
                    {userAnswers.filter((a) => !a.correct).length}
                  </div>
                </div>
              </div>
              {currentQuestion.question}
            </h3>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  disabled={showResult || showTimeoutPopup}
                  className={`${getOptionStyle(option)} ${!showResult
                      ? "cursor-pointer hover:opacity-90"
                      : "cursor-default"
                    }`}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeout Popup */}
      {showTimeoutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#262A35] p-6 rounded-2xl max-w-sm w-full mx-4 text-center relative">
            <button
              onClick={() => router.push('/start')}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-2">
              Time&apos;s Up! ⏱️
            </h3>
            <p className="text-gray-300 mb-4">
              You&apos;ve run out of time for this question.
            </p>
            {!showAdvertisement && (
              <button
                onClick={handleWatchAd}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
              >
                Watch Ad to Add 2 Minutes
              </button>
            )}
            {showAdvertisement && (
              <div className="mt-4">
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <p className="text-yellow-400 mb-2">Advertisement Playing...</p>
                  <p className="text-sm text-gray-400">2 minutes added to your timer!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const QuizPage = () => {
  return (
    <Suspense fallback={<Loading />}>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-1">
        {/* Left Sidebar */}
        <div className="w-full xl:block hidden max-w-[300px] fixed top-[100px] md:left-[250px] left-[50px]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4">
            <div className="flex justify-center">
              <GoogleAd
                adSlot="4759661214"
              
              />
            </div>
          </div>
        </div>
        {/* Right Sidebar */}
        <div className="w-full xl:block hidden max-w-[300px] fixed top-[100px] md:right-[250px] right-[50px]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4">
            <div className="flex justify-center">
              <GoogleAd
                adSlot="1279565299"
               
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-[450px] z-10">
          <QuizPageContent />
        </div>
      </div>
    </Suspense>
  );
};

export default QuizPage;
