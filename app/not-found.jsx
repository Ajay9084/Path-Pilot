"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-9xl font-extrabold tracking-widest"
      >
        404
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-lg text-gray-400"
      >
        Oops! The page you’re looking for doesn’t exist.
      </motion.p>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <Link
          href="/"
          className="inline-flex items-center  text-black gap-2 rounded-2xl bg-white px-6 py-3 text-lg font-medium shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-500 hover:shadow-xl "
        >
          <Home size={20} /> Go Home
        </Link>
      </motion.div>
    </div>
  );
}
