import React from "react";
const data = [
  "Get coins on the completion of each quiz.",
  "Upgrade your skills with our top quizzes.",
  "We have many top trending categories like Cricket, World, India, Business, loan, insurance, finance & many more!",
  "Millions of quiz admirer like you showed trust on us.",
  "Challenge lakhs of players from across the world!",
];
const Rules = ({rulesData}: {rulesData?: string[]}) => {
  const rules = rulesData || data;

  return (
    <div className="w-full max-w-[450px] mt-12">
      <div className="relative bg-[#262A35] w-full p-6 rounded-lg">
        <div className="w-full h-[35px] flex items-center justify-center">
          <div className="w-[180px] h-[40px] p-1 bg-[#262A35] rounded-[20px] -mt-16">
            <div className="w-full flex items-center justify-center font-bold h-full bg-[#181A20] rounded-[20px] text-sm">
              {rulesData?"Contest Rules":"Play & Win Coins! 🎉"}
            </div>
          </div>
        </div>
        <div className="space-y-5 text-[#E2E2E2] mt-6 px-2">
          <h2 className="text-xl text-center font-bold text-white mb-2">
            {rulesData?"Contest Rules":"Play Quiz and Win Coins! 🎯"}
          </h2>
          <ul className="space-y-3 pl-0">
            {rules.map((item) => (
              <li key={item} className="flex items-start">
              <svg
                className="flex-shrink-0 text-green-400 mt-1 mr-2"
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path>
              </svg>
              <span>{item}</span>
            </li>
            ))}
            <li className="flex items-start">
              <svg
                className="flex-shrink-0 text-green-400 mt-1 mr-2"
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path>
              </svg>
              <span>Upgrade your skills with our top quizzes.</span>
            </li>
            <li className="flex items-start">
              <svg
                className="flex-shrink-0 text-green-400 mt-1 mr-2"
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path>
              </svg>
              <span>
                We have many top trending categories like Cricket, World, India,
                Business, loan, insurance, finance & many more!
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="flex-shrink-0 text-green-400 mt-1 mr-2"
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path>
              </svg>
              <span>Millions of quiz admirer like you showed trust on us.</span>
            </li>
            <li className="flex items-start">
              <svg
                className="flex-shrink-0 text-green-400 mt-1 mr-2"
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path>
              </svg>
              <span>Challenge lakhs of players from across the world!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Rules;
