"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import DesignOptimizer, { useOverlapCheck } from "./DesignOptimizer";
import BlockchainLanding3D from "../FX/SimpleBlockchain3D";

// Intersection Observer Hook
function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options, hasIntersected]);

  return [ref, isIntersecting, hasIntersected];
}

// Client-side only wrapper for 3D components
function ClientOnly({ children }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="absolute inset-0 bg-black" />;
  }

  return children;
}

// Optimized Hero Section
function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Throttle mouse movement for better performance
      requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: -(e.clientY / window.innerHeight) * 2 + 1,
        });
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background - Client Only */}
      <ClientOnly>
        <BlockchainLanding3D />
      </ClientOnly>
      
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{
            transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
          }}
        >
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Blockchain
            <br />
            <span className="text-4xl md:text-6xl lg:text-7xl">Ecosystem</span>
          </motion.h1>
        </motion.div>
        
        <motion.p
          className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          Experience the future of decentralized applications with our cutting-edge
          blockchain tools and platforms
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          <ConnectButton />
          <motion.button
            className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-base md:text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore DApps
          </motion.button>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Optimized DApp Card with intersection observer
function DAppCard({ title, description, icon, color, href, index }) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });
  const overlapCheck = useOverlapCheck();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      className="relative group"
    >
      <Link href={href} className="block">
        <div {...overlapCheck} className={`relative p-6 md:p-8 rounded-2xl bg-gradient-to-br ${color} cursor-pointer overflow-hidden transform transition-all duration-500 hover:shadow-2xl h-full`}>
          {/* Background pattern - optimized SVG */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="text-4xl md:text-6xl mb-4">{icon}</div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">{title}</h3>
            <p className="text-gray-200 leading-relaxed text-sm md:text-base">{description}</p>
          </div>
          
          {/* Hover effect */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
        </div>
      </Link>
    </motion.div>
  );
}

// Optimized DApps Section
function DAppsSection() {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
  
  const dapps = [
    {
      title: "ChatLedger",
      description: "Decentralized messaging platform with crypto transfers, secure communication, and blockchain-based friend connections.",
      icon: "💬",
      color: "from-blue-600 to-cyan-600",
      href: "/app"
    },
    {
      title: "NFT Marketplace",
      description: "Trade, create, and discover unique digital assets on our advanced NFT marketplace with low fees and fast transactions.",
      icon: "🎨",
      color: "from-purple-600 to-pink-600",
      href: "/nft-marketplace"
    },
    {
      title: "StorLedger",
      description: "Decentralized file storage solution with IPFS integration, secure data sharing, and blockchain-based access control.",
      icon: "📁",
      color: "from-green-600 to-emerald-600",
      href: "/stor-ledger"
    }
  ];

  return (
    <section ref={ref} className="py-16 md:py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Our DApp Ecosystem
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Discover our suite of decentralized applications built on cutting-edge blockchain technology
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {dapps.map((dapp, index) => (
            <DAppCard key={dapp.title} {...dapp} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Optimized Stats Section
function StatsSection() {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
  
  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Transactions" },
    { number: "99.9%", label: "Uptime" },
    { number: "3", label: "DApps" }
  ];

  return (
    <section ref={ref} className="py-16 md:py-20 px-4 bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isIntersecting ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-gray-300 text-sm md:text-lg">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Optimized Footer
function Footer() {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
  
  return (
    <footer ref={ref} className="py-8 md:py-12 px-4 bg-black border-t border-gray-800">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Blockchain Ecosystem</h3>
          <p className="text-gray-400 mb-6">
            Building the future of decentralized applications
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Discord</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

// Main Optimized Landing Page Component
export default function OptimizedLandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  return (
    <DesignOptimizer>
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <motion.div style={{ y }}>
          <HeroSection />
          <DAppsSection />
          <StatsSection />
          <Footer />
        </motion.div>
      </div>
    </DesignOptimizer>
  );
}
