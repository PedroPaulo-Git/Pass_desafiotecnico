"use client";

import React from "react";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Bus,
  Fuel,
  FileWarning,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1] as any,
    },
  },
};

// const floatingVariants = {
//   animate: {
//     y: [0, -10, 0],
//     transition: {
//       duration: 3,
//       repeat: Number.POSITIVE_INFINITY,
//       ease: "easeInOut",
//     },
//   },
// };

// const pulseVariants = {
//   animate: {
//     scale: [1, 1.05, 1],
//     opacity: [0.5, 0.8, 0.5],
//     transition: {
//       duration: 2,
//       repeat: Number.POSITIVE_INFINITY,
//       ease: "easeInOut",
//     },
//   },
// };

export function HeaderHome() {
  const { t } = useI18n();

  const features = [
    {
      icon: Bus,
      title: t.home.features.vehicles,
      description: t.home.features.vehiclesDesc,
      color: "from-blue-500 to-cyan-500",
      delay: 0,
    },
    {
      icon: Fuel,
      title: t.home.features.fueling,
      description: t.home.features.fuelingDesc,
      color: "from-green-500 to-emerald-500",
      delay: 0.1,
    },
    {
      icon: FileWarning,
      title: t.home.features.incidents,
      description: t.home.features.incidentsDesc,
      color: "from-orange-500 to-amber-500",
      delay: 0.2,
    },
    {
      icon: FileText,
      title: t.home.features.documents,
      description: t.home.features.documentsDesc,
      color: "from-purple-500 to-pink-500",
      delay: 0.3,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className=""
    >
      <header className="relative w-full z-10 container mx-auto px-4 lg:px-20 pt-20">
        {/* Conteúdo do cabeçalho */}
        <div className="topHeader w-full flex justify-between items-center">
          <motion.div variants={itemVariants}>
            <img
              src="/assets/Logo_pass.svg"
              className="w-28 md:w-32"
              alt="Logo PASS"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/dashboard" className=" ">
              <Button
                size="lg"
                className="inline-flex bg-transparent items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-neutral-300 border border-white hover:bg-white/20 hover:backdrop-blur-sm h-9 text-white px-5"
              >
                {t.home.getStarted}
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mt-28 md:mt-24 lg:mt-32"
        >
          {/* Title */}
          <div className="text-3xl md:text-4xl lg:text-5xl font-bold lg:max-w-xl">
            <motion.h1 variants={itemVariants} className="text-white">
              A Solução Completa
            </motion.h1>
            <motion.h1 variants={itemVariants}  className="font-normal inline-flex bg-clip-text text-transparent bg-linear-to-r from-green-400 to-blue-300 ">
              para Frotas e Agências de Turismo e Fretamento
            </motion.h1>
          </div>
         
          {/* CTA Button */}
          <motion.div variants={itemVariants}>
            <Link
              href="/dashboard"
              className="inline-flex  
       hover:backdrop-blur-sm hover:scale-[101%] ease-in-out duration-3000 transition-transform
      items-center justify-center gap-2 whitespace-nowrap rounded-full 
      font-medium h-9 mt-6 md:mt-8 px-6 md:px-8 border-2
      border-white py-5 md:py-6 text-white text-base md:text-lg cursor-default"
            >
              Seja Pass. Seja Livre
            </Link>
          </motion.div>
        </motion.div>
      </header>
    </motion.div>
  );
}
