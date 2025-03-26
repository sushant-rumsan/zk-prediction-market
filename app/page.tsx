"use client";

import { Navbar } from "@/components/navbar";
import { EventCard } from "@/components/event-card";
import { useGetEvents } from "@/hooks/api-hooks";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Search,
  Plus,
  TrendingUp,
  Shield,
  Lock,
  Zap,
  ChevronRight,
  ArrowRight,
  BarChart2,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function EventsPage() {
  const { data: eventsData } = useGetEvents();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Filter events based on search term
  useEffect(() => {
    if (!eventsData?.events) {
      setFilteredEvents([]);
      return;
    }

    let filtered = eventsData.events;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (event: any) =>
          event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.eventDetail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.eventId.toString().includes(searchTerm)
      );
    }

    // Apply category filter
    if (activeCategory !== "all") {
      // This is a mock implementation - in a real app, you'd filter by actual categories
      const categoryMap: { [key: string]: number[] } = {
        crypto: [101, 103],
        politics: [102],
        technology: [104],
      };

      if (categoryMap[activeCategory]) {
        filtered = filtered.filter((event: any) =>
          categoryMap[activeCategory].includes(event.eventId)
        );
      }
    }

    setFilteredEvents(filtered);
  }, [searchTerm, eventsData, activeCategory]);

  // Mock data for demonstration
  const events =
    filteredEvents.length > 0
      ? filteredEvents
      : [
          {
            id: 1,
            eventId: 101,
            eventName: "Bitcoin Price Prediction",
            eventDetail: "Will Bitcoin exceed $100,000 by the end of 2025?",
            isActive: true,
            isChainSuccess: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            yesVotes: 75,
            noVotes: 25,
          },
          {
            id: 2,
            eventId: 102,
            eventName: "US Presidential Election",
            eventDetail:
              "Will the Democratic candidate win the 2024 US Presidential Election?",
            isActive: true,
            isChainSuccess: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            yesVotes: 52,
            noVotes: 48,
          },
          {
            id: 3,
            eventId: 103,
            eventName: "Ethereum Merge Success",
            eventDetail:
              "Will Ethereum complete its next major upgrade without critical issues?",
            isActive: true,
            isChainSuccess: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            yesVotes: 88,
            noVotes: 12,
          },
          {
            id: 4,
            eventId: 104,
            eventName: "AI Breakthrough",
            eventDetail:
              "Will a major AI breakthrough occur that surpasses human-level intelligence in all domains?",
            isActive: true,
            isChainSuccess: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            yesVotes: 35,
            noVotes: 65,
          },
        ];

  // Stats data
  const stats = [
    {
      label: "Active Events",
      value: "24+",
      icon: <BarChart2 className="h-5 w-5 text-indigo-500" />,
    },
    {
      label: "Total Users",
      value: "2.5K+",
      icon: <Globe className="h-5 w-5 text-emerald-500" />,
    },
    {
      label: "Predictions Made",
      value: "18K+",
      icon: <TrendingUp className="h-5 w-5 text-amber-500" />,
    },
    {
      label: "Success Rate",
      value: "99.9%",
      icon: <Shield className="h-5 w-5 text-rose-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative pt-20 pb-16 md:pt-24 md:pb-24 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-indigo-50 to-transparent rounded-full blur-3xl opacity-60 transform translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-emerald-50 to-transparent rounded-full blur-3xl opacity-60 transform -translate-x-1/4 translate-y-1/4"></div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOHY2YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJoNnptLTYgNmMwIDYuNjI3LTUuMzczIDEyLTEyIDEycy0xMi01LjM3My0xMi0xMiA1LjM3My0xMiAxMi0xMiAxMiA1LjM3MyAxMiAxMnoiIGZpbGw9IiNlZWUiLz48L2c+PC9zdmc+')] opacity-[0.02]"></div>

          {/* Animated Circles */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-indigo-400 opacity-70 animate-pulse"></div>
          <div
            className="absolute top-3/4 right-1/4 w-3 h-3 rounded-full bg-emerald-400 opacity-70 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-amber-400 opacity-70 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <motion.div
          className="container mx-auto px-4 relative z-10"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-800 text-sm font-medium mb-6"
            >
              <span className="flex h-2 w-2 relative mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Powered by Zero-Knowledge Technology
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Predict the Future with
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 ml-2">
                Privacy
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              AleoPredict combines the wisdom of crowds with the security of
              zero-knowledge proofs, creating the most private and accurate
              prediction markets.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              <Link href="#events">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-indigo-200/50 flex items-center justify-center"
                >
                  Explore Events
                  <ChevronRight className="ml-1 h-5 w-5" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all duration-200 shadow-md flex items-center justify-center"
              >
                How It Works
              </motion.button>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            ref={statsRef}
            className="max-w-5xl mx-auto mt-16 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={
              isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
            }
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
              {stats.map((stat, index) => (
                <div key={index} className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={
              isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose AleoPredict?
            </h2>
            <p className="text-lg text-gray-600">
              Our platform combines cutting-edge blockchain technology with
              intuitive design to create the most secure and user-friendly
              prediction market.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={
                isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-8 -mt-8"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
                  <Lock className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Complete Privacy
                </h3>
                <p className="text-gray-600">
                  Your predictions and stakes are protected by zero-knowledge
                  proofs, ensuring your privacy while maintaining transparency.
                </p>
                <div className="mt-6">
                  <Link
                    href="/about"
                    className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                  >
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={
                isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Secure Infrastructure
                </h3>
                <p className="text-gray-600">
                  Built on Aleo's blockchain technology, our platform offers
                  unmatched security and reliability for all transactions.
                </p>
                <div className="mt-6">
                  <Link
                    href="/security"
                    className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                  >
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={
                isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-8 -mt-8"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-6">
                  <Zap className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Lightning Fast
                </h3>
                <p className="text-gray-600">
                  Experience near-instant transactions and event resolutions,
                  with minimal fees and maximum efficiency.
                </p>
                <div className="mt-6">
                  <Link
                    href="/performance"
                    className="inline-flex items-center text-amber-600 font-medium hover:text-amber-700 transition-colors"
                  >
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Ongoing Events
                </h2>
                <p className="text-gray-600">
                  Choose & Predict on event you want
                </p>
              </div>

              <div className="w-full md:w-auto flex items-center gap-4">
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 shadow-sm"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md flex items-center whitespace-nowrap"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Suggest Event
                </motion.button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-8 overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === "all"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All Events
                </button>
                <button
                  onClick={() => setActiveCategory("crypto")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === "crypto"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Cryptocurrency
                </button>
                <button
                  onClick={() => setActiveCategory("politics")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === "politics"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Politics
                </button>
                <button
                  onClick={() => setActiveCategory("technology")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === "technology"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Technology
                </button>
              </div>
            </div>

            {events && events.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event: any, index: number) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mx-auto h-24 w-24 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                    <path d="M8 14h.01" />
                    <path d="M12 14h.01" />
                    <path d="M16 14h.01" />
                    <path d="M8 18h.01" />
                    <path d="M12 18h.01" />
                    <path d="M16 18h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No Events Found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  There are no prediction events available at the moment. Create
                  a new event to get started.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md inline-flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-white opacity-5 rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-white opacity-5 rounded-full transform -translate-x-1/4 translate-y-1/4"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Ready to start predicting?
            </motion.h2>
            <motion.p
              className="text-indigo-100 mb-8 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Join our community of forecasters and put your knowledge to the
              test. Start making predictions today with complete privacy.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl font-medium text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-all duration-200 shadow-lg"
              >
                Connect Wallet
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl font-medium text-white bg-indigo-500 bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm border border-indigo-400 border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-all duration-200"
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
