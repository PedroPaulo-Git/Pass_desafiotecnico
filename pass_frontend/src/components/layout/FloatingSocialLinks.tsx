"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Language } from "@/lib/i18n/translations";

const languages = [
  {
    code: "pt" as Language,
    name: "Português",
    state: "Brasil",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/120px-Flag_of_Brazil.svg.png",
  },
  {
    code: "en" as Language,
    state: "United States",
    name: "English",
    flag: "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg",
  },
  {
    code: "es" as Language,
    name: "Español",
    state: "España",
    flag: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg",
  },
];

export function FloatingSocialLinks() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();

  const currentLang = languages.find((lang) => lang.code === language);

  return (
    <section className="fixed bottom-0 left-0 w-14 m-6 z-50">
      <div className="flex flex-col gap-2">
        {/* Language Dropdown */}
        <div className="relative">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 mb-2 w-40 md:w-52 bg-white rounded-lg shadow-2xl overflow-hidden"
              >
                {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`md:w-[85%] w-36 px-4  mx-auto md:px-4 md:py-3 flex items-center gap-3 hover:bg-gray-100 my-2  rounded-lg transition-colors ${
                      language === lang.code ? "bg-blue-50" : ""
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img className="w-6 h-4" src={lang.flag} alt={lang.name} />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-700">
                        {lang.name}
                      </span>
                      <p className="text-gray-300 text-xs text-nowrap">{lang.state}</p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 mx-auto bg-white shadow-xl rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            whileTap={{ scale: 0.95 }}
          >
            <img
              className="w-6 h-4"
              src={currentLang?.flag}
              alt={currentLang?.name}
            />
          </motion.button>
        </div>
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10  mx-auto bg-white  shadow-xl rounded-full flex items-center justify-center hover:scale-110 transition-transform"
          href="https://www.linkedin.com/company/bepassbefree"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-linkedin"
          >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect width="4" height="12" x="2" y="9"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10  mx-auto bg-white  shadow-xl rounded-full flex items-center justify-center hover:scale-110 transition-transform"
          href="https://www.instagram.com/bepassbefree"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-instagram"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
          </svg>
        </a>
      </div>
    </section>
  );
}
