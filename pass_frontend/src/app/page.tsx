import { HeaderHome } from "@/components/layout/HeaderHome";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative">
        <div>
          <img
            src="/assets/WallpaperHome.jpg"
            className="absolute w-screen h-screen object-cover brightness-75"
            alt="Wallpaper Home"
          />
        </div>
    
        <HeaderHome />
      </section>
    </main>
  );
}
// "use client"

// import { motion } from "framer-motion"
// import Link from "next/link"
// import { Bus, Fuel, FileWarning, FileText, ArrowRight, Sparkles } from "lucide-react"
// import { useI18n } from "@/lib/i18n/i18n-context"
// import { Button } from "@/components/ui/button"

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.15,
//       delayChildren: 0.2,
//     },
//   },
// }

// const itemVariants = {
//   hidden: { opacity: 0, y: 30 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.6,
//       ease: [0.25, 0.4, 0.25, 1],
//     },
//   },
// }

// const floatingVariants = {
//   animate: {
//     y: [0, -10, 0],
//     transition: {
//       duration: 3,
//       repeat: Number.POSITIVE_INFINITY,
//       ease: "easeInOut",
//     },
//   },
// }

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
// }

// export default function HomePage() {
//   const { t } = useI18n()

//   const features = [
//     {
//       icon: Bus,
//       title: t.home.features.vehicles,
//       description: t.home.features.vehiclesDesc,
//       color: "from-blue-500 to-cyan-500",
//       delay: 0,
//     },
//     {
//       icon: Fuel,
//       title: t.home.features.fueling,
//       description: t.home.features.fuelingDesc,
//       color: "from-green-500 to-emerald-500",
//       delay: 0.1,
//     },
//     {
//       icon: FileWarning,
//       title: t.home.features.incidents,
//       description: t.home.features.incidentsDesc,
//       color: "from-orange-500 to-amber-500",
//       delay: 0.2,
//     },
//     {
//       icon: FileText,
//       title: t.home.features.documents,
//       description: t.home.features.documentsDesc,
//       color: "from-purple-500 to-pink-500",
//       delay: 0.3,
//     },
//   ]

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
//       {/* Background Elements */}
//       <div className="fixed inset-0 -z-10">
//         <motion.div
//           variants={pulseVariants}
//           animate="animate"
//           className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
//         />
//         <motion.div
//           variants={pulseVariants}
//           animate="animate"
//           style={{ animationDelay: "1s" }}
//           className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
//         />
//       </div>

//       <div className="container mx-auto px-4 py-20">
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           className="flex flex-col items-center text-center"
//         >
//           {/* Logo Animation */}
//           <motion.div variants={itemVariants} className="mb-8">
//             <motion.div variants={floatingVariants} animate="animate" className="relative">
//               <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/25">
//                 <Bus className="h-10 w-10 text-primary-foreground" />
//               </div>
//               <motion.div
//                 initial={{ scale: 0, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ delay: 0.5, duration: 0.4 }}
//                 className="absolute -top-2 -right-2"
//               >
//                 <Sparkles className="h-6 w-6 text-yellow-500" />
//               </motion.div>
//             </motion.div>
//           </motion.div>

//           {/* Title */}
//           <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
//             <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
//               {t.home.title}
//             </span>
//           </motion.h1>

//           {/* Subtitle */}
//           <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground mb-4">
//             {t.home.subtitle}
//           </motion.p>

//           {/* Description */}
//           <motion.p variants={itemVariants} className="text-muted-foreground max-w-2xl mb-10">
//             {t.home.description}
//           </motion.p>

//           {/* CTA Button */}
//           <motion.div variants={itemVariants}>
//             <Link href="/dashboard">
//               <Button
//                 size="lg"
//                 className="group gap-2 px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
//               >
//                 {t.home.getStarted}
//                 <motion.div initial={{ x: 0 }} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
//                   <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
//                 </motion.div>
//               </Button>
//             </Link>
//           </motion.div>

//           {/* Features Grid */}
//           <motion.div
//             variants={containerVariants}
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 w-full max-w-6xl"
//           >
//             {features.map((feature, index) => (
//               <motion.div
//                 key={feature.title}
//                 variants={itemVariants}
//                 custom={index}
//                 whileHover={{ y: -8, transition: { duration: 0.2 } }}
//                 className="group relative"
//               >
//                 <div
//                   className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl -z-10"
//                   style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
//                 />
//                 <div className="relative p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all duration-300 h-full">
//                   <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
//                     <feature.icon className="h-6 w-6 text-white" />
//                   </div>
//                   <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
//                   <p className="text-sm text-muted-foreground">{feature.description}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </motion.div>
//       </div>
//     </div>
//   )
// }

