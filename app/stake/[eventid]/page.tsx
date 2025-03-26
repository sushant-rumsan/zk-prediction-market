"use client";

import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { Transaction } from "@demox-labs/aleo-wallet-adapter-base";
import { BLOCKCHAIN } from "@/constants/blockchain";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCreateStake,
  useGetEventByEventID,
  useGetStakeDetail,
} from "@/hooks/api-hooks";
import { getUserStakeKey } from "@/utils/getUserStakeKey";
import { useDokoJsWASM } from "@/hooks/useDokojs";
import { getEvents } from "@/utils/getEvents";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Info,
  TrendingUp,
  Shield,
  Users,
  User,
} from "lucide-react";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function StakeEventPage() {
  const params = useParams();
  const eventId = params?.eventid as string;
  const router = useRouter();

  const { publicKey, requestTransaction } = useWallet();
  const [amount, setAmount] = useState<string>("");
  const [prediction, setPrediction] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [txId, setTxId] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [dokoJsWasm] = useDokoJsWASM();
  const [event, setEvent] = useState<any>(null);
  const [eventLoading, setEventLoading] = useState(true);

  const { mutateAsync } = useCreateStake();
  const { data: eventBEData } = useGetEventByEventID(eventId);

  const { data } = useGetStakeDetail(publicKey, +eventId);

  // Data for the global prediction distribution chart
  const [voteData, setVoteData] = useState({
    yesVotes: 65,
    noVotes: 35,
  });

  // Chart options and configurations
  const globalChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "70%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw}%`,
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  // Global prediction chart data
  const globalChartData = {
    labels: ["Yes", "No"],
    datasets: [
      {
        data: [voteData.yesVotes, voteData.noVotes],
        backgroundColor: [
          "rgba(16, 185, 129, 0.9)", // Vibrant green
          "rgba(244, 63, 94, 0.9)", // Vibrant rose
        ],
        borderColor: ["rgba(16, 185, 129, 1)", "rgba(244, 63, 94, 1)"],
        borderWidth: 1,
        hoverBackgroundColor: ["rgba(16, 185, 129, 1)", "rgba(244, 63, 94, 1)"],
        hoverBorderColor: ["rgba(16, 185, 129, 1)", "rgba(244, 63, 94, 1)"],
        hoverBorderWidth: 2,
      },
    ],
  };

  // Personal stake chart data
  const personalStakeYes = +(data?.res?.stakeAmountYes || 0);
  const personalStakeNo = +(data?.res?.stakeAmountNo || 0);
  const totalPersonalStake = personalStakeYes + personalStakeNo;

  const personalYesPercentage =
    totalPersonalStake > 0
      ? Math.round((personalStakeYes / totalPersonalStake) * 100)
      : 0;

  const personalNoPercentage =
    totalPersonalStake > 0
      ? Math.round((personalStakeNo / totalPersonalStake) * 100)
      : 0;

  const personalChartData = {
    labels: ["Yes", "No"],
    datasets: [
      {
        data: [personalYesPercentage, personalNoPercentage],
        backgroundColor: [
          "rgba(56, 189, 248, 0.9)", // Vibrant sky blue
          "rgba(251, 146, 60, 0.9)", // Vibrant amber
        ],
        borderColor: ["rgba(56, 189, 248, 1)", "rgba(251, 146, 60, 1)"],
        borderWidth: 1,
        hoverBackgroundColor: [
          "rgba(56, 189, 248, 1)",
          "rgba(251, 146, 60, 1)",
        ],
        hoverBorderColor: ["rgba(56, 189, 248, 1)", "rgba(251, 146, 60, 1)"],
        hoverBorderWidth: 2,
      },
    ],
  };

  const personalChartOptions = {
    ...globalChartOptions,
    plugins: {
      ...globalChartOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const rawValue =
              context.dataIndex === 0 ? personalStakeYes : personalStakeNo;
            return `${
              context.label
            }: ${value}% (${rawValue.toLocaleString()} credits)`;
          },
        },
      },
    },
  };

  const fetchEventDetails = async () => {
    setEventLoading(true);
    try {
      const eventData = await getEvents("events", eventId);
      if (eventData.data === "None") {
        setError(
          "This event is either pending blockchain transaction or is not valid!"
        );
      } else {
        setEvent(eventData);
        setVoteData({
          yesVotes: eventData.total_yes_stake,
          noVotes: eventData.total_no_stake,
        });

        if (eventData.resolved) {
          setError(
            `Event Already resolved with outcome: ${eventData.outcome}, you can not further interact with this event`
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch event details:", err);
      setError("Failed to load event details");
    } finally {
      setEventLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const validateInputs = (): boolean => {
    if (!eventId) {
      setError("Event ID is required");
      return false;
    }
    const amountNum = Number.parseInt(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError("Amount must be a positive number");
      return false;
    }
    return true;
  };

  const handleStake = async () => {
    if (!publicKey || !requestTransaction) {
      setError("Please connect your wallet");
      return;
    }

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setError("");
    setTxId(null);
    setSuccess(false);

    try {
      const stakeKey = await getUserStakeKey(eventId, publicKey, dokoJsWasm);

      mutateAsync({
        publicKey,
        eventId,
        stakeKey,
        stakeAmountYes: prediction ? amount : "0",
        stakeAmountNo: prediction ? "0" : amount,
      }).then(async () => {
        const aleoTransaction = Transaction.createTransaction(
          publicKey,
          "Testnet",
          BLOCKCHAIN.PROGRAM_ID,
          "stake_public",
          [`${eventId}field`, `${amount}u64`, prediction ? "true" : "false"],
          1_000_000
        );

        const transactionId = await requestTransaction(aleoTransaction);
        setTxId(transactionId);
        setSuccess(true);
        console.log("Stake Transaction ID:", transactionId);

        // Update vote data to reflect the new stake
        setVoteData((prev) => {
          const newYesVotes = prediction
            ? prev.yesVotes + 2
            : Math.max(prev.yesVotes - 1, 0);
          const newNoVotes = !prediction
            ? prev.noVotes + 2
            : Math.max(prev.noVotes - 1, 0);

          const total = newYesVotes + newNoVotes;
          return {
            yesVotes: Math.round((newYesVotes / total) * 100),
            noVotes: Math.round((newNoVotes / total) * 100),
          };
        });
      });
    } catch (err) {
      setError(
        `Failed to stake: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Particle animation variants
  const particleVariants = {
    animate: {
      x: ["-100%", "100%"],
      transition: {
        x: {
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          duration: 25,
          ease: "linear",
        },
      },
    },
  };

  // Individual particle animation for slight vertical drift
  const particleDrift = {
    animate: {
      y: [0, -10, 0],
      transition: {
        y: {
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          duration: 5,
          ease: "easeInOut",
        },
      },
    },
  };

  // Custom chart center text plugin
  const centerTextPlugin = {
    id: "centerText",
    afterDraw: (chart: any) => {
      const { ctx, width, height } = chart;
      ctx.restore();

      // For global chart
      if (chart.canvas.id === "globalChart") {
        const yesPercentage = voteData.yesVotes;

        // Draw YES percentage
        ctx.font = "bold 24px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#111827";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${yesPercentage}%`, width / 2, height / 2 - 10);

        // Draw YES label
        ctx.font = "14px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#6b7280";
        ctx.fillText("YES", width / 2, height / 2 + 15);
      }

      // For personal chart
      if (chart.canvas.id === "personalChart" && totalPersonalStake > 0) {
        // Draw total stake
        ctx.font = "bold 18px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#111827";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `${totalPersonalStake.toLocaleString()}`,
          width / 2,
          height / 2 - 10
        );

        // Draw credits label
        ctx.font = "12px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#6b7280";
        ctx.fillText("CREDITS", width / 2, height / 2 + 15);
      }

      ctx.save();
    },
  };

  // Register the plugin
  ChartJS.register(centerTextPlugin);

  return (
    <div className="min-h-screen bg-white">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-100 to-blue-100 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-20 left-[5%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-green-100 to-teal-100 opacity-30 blur-3xl"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-amber-100 to-orange-100 opacity-20 blur-3xl"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOHY2YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJoNnptLTYgNmMwIDYuNjI3LTUuMzczIDEyLTEyIDEycy0xMi01LjM3My0xMi0xMiA1LjM3My0xMiAxMi0xMiAxMiA1LjM3MyAxMiAxMnoiIGZpbGw9IiNlZWUiLz48L2c+PC9zdmc+')] opacity-[0.02]"></div>

        {/* Floating particles */}
        <motion.div
          className="absolute w-[200%] h-full"
          variants={particleVariants}
          animate="animate"
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-blue-400 opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: "0 0 8px 2px rgba(96, 165, 250, 0.5)",
              }}
              variants={particleDrift}
              animate="animate"
            />
          ))}
        </motion.div>
        <motion.div
          className="absolute w-[200%] h-full"
          variants={particleVariants}
          animate="animate"
          initial={{ x: "100%" }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-green-400 opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: "0 0 6px 1px rgba(74, 222, 128, 0.5)",
              }}
              variants={particleDrift}
              animate="animate"
            />
          ))}
        </motion.div>
      </div>

      <div className="container mx-auto px-4 pt-10 pb-12 relative z-10">
        <div className="mb-6">
          <Link
            href={`/#events`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-sm">Back to Event</span>
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Left column - Stake Form */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="h-5 w-5 text-gray-700" />
                <h2 className="text-base font-medium text-gray-900">
                  Place Your Stake
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Stake Amount (microcredits)
                  </label>
                  <div className="relative">
                    <input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g., 1000000"
                      min="1"
                      disabled={loading}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all hover:border-gray-300"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 flex items-center">
                    <Info className="mr-1 h-3 w-3" />1 credit = 1,000,000
                    microcredits
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Prediction
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setPrediction(true)}
                      className={`px-3 py-2.5 rounded-xl text-sm flex items-center justify-center transition-all cursor-pointer ${
                        prediction
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <CheckCircle className="mr-1.5 h-4 w-4" />
                      Yes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setPrediction(false)}
                      className={`px-3 py-2.5 rounded-xl text-sm flex items-center justify-center transition-all cursor-pointer ${
                        !prediction
                          ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      No
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {!publicKey && (
                    <motion.div
                      className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-800"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex">
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="ml-2">
                          <h3 className="text-xs font-medium text-amber-800">
                            Wallet not connected
                          </h3>
                          <p className="text-xs text-amber-700 mt-0.5">
                            Please connect your wallet to place a stake.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-800"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="ml-2">
                          <h3 className="text-xs font-medium text-red-800">
                            Error
                          </h3>
                          <p className="text-xs text-red-700 mt-0.5">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {txId && success && (
                    <motion.div
                      className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-800"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="ml-2">
                          <h3 className="text-xs font-medium text-green-800">
                            Stake Placed Successfully
                          </h3>
                          <p className="text-xs text-green-700 mt-0.5">
                            Your stake has been placed on the blockchain.
                          </p>
                          <a
                            href={`https://explorer.aleo.org/transaction/${txId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-800 hover:text-black hover:underline mt-1"
                          >
                            View transaction
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleStake}
                  disabled={
                    !publicKey || loading || !amount || error?.length > 0
                  }
                  className="w-full py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-gray-800 to-gray-900 hover:from-black hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Place Stake
                    </div>
                  )}
                </motion.button>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  About Staking
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      When you stake on an event, you're predicting its outcome
                      and backing your prediction with credits.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      If your prediction is correct, you'll receive a payout
                      proportional to your stake and the odds at the time of
                      staking.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      All stakes are secured on the blockchain using
                      zero-knowledge technology, ensuring transparency and
                      privacy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Event Info and Charts */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="p-6">
              <div className="flex justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-700" />
                  <h2 className="text-base font-medium text-gray-900">
                    Event #{eventId}
                  </h2>
                </div>
                {event?.resolved && (
                  <div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => router.push(`/claim/${eventId}`)}
                      className={`px-3 py-2.5 rounded-xl text-sm flex items-center justify-center transition-all cursor-pointer ${
                        prediction
                          ? "bg-gradient-to-r from-gray-600 to-gray-600 text-white shadow-md px-8"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      Claim
                    </motion.button>
                  </div>
                )}
              </div>

              {eventLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        {eventBEData?.res?.eventName ||
                          "Bitcoin Price Prediction"}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        {eventBEData?.res?.eventDetail ||
                          "Will Bitcoin exceed $100,000 by the end of 2025?"}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-xs font-medium text-gray-700">
                              Status
                            </span>
                          </div>
                          <span className="text-xs text-gray-900">
                            {eventBEData?.res?.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="h-2 w-2 rounded-full bg-gray-800"></div>
                            <span className="text-xs font-medium text-gray-700">
                              Created
                            </span>
                          </div>
                          <span className="text-xs text-gray-900">
                            {event?.createdAt
                              ? new Date(event.createdAt).toLocaleDateString()
                              : new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Global Prediction Distribution Chart */}
                    <div className="flex flex-col items-center">
                      <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                        <Users className="h-4 w-4 mr-1.5 text-gray-700" />
                        Global Prediction
                      </h3>

                      <motion.div
                        className="relative w-full max-w-[180px] mx-auto mb-4"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Doughnut
                          id="globalChart"
                          data={globalChartData}
                          options={globalChartOptions}
                        />
                      </motion.div>

                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col items-center p-3 rounded-xl bg-green-50 border border-green-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-xs font-medium text-green-700">
                              Yes
                            </span>
                          </div>
                          <span className="text-base font-medium text-gray-900">
                            {voteData.yesVotes}
                          </span>
                        </div>

                        <div className="flex flex-col items-center p-3 rounded-xl bg-rose-50 border border-rose-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                            <span className="text-xs font-medium text-rose-700">
                              No
                            </span>
                          </div>
                          <span className="text-base font-medium text-gray-900">
                            {voteData.noVotes}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Personal Stake Distribution Chart */}
                    <div className="flex flex-col items-center">
                      <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                        <User className="h-4 w-4 mr-1.5 text-gray-700" />
                        Your Stake
                      </h3>

                      <motion.div
                        className="relative w-full max-w-[180px] mx-auto mb-4"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        {totalPersonalStake > 0 ? (
                          <Doughnut
                            id="personalChart"
                            data={personalChartData}
                            options={personalChartOptions}
                          />
                        ) : (
                          <div className="h-[180px] flex items-center justify-center bg-gray-50 rounded-full border border-gray-100">
                            <p className="text-sm text-gray-500">
                              No stakes yet
                            </p>
                          </div>
                        )}
                      </motion.div>

                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col items-center p-3 rounded-xl bg-sky-50 border border-sky-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="h-2 w-2 rounded-full bg-sky-500"></div>
                            <span className="text-xs font-medium text-sky-700">
                              Yes Stake
                            </span>
                          </div>
                          <span className="text-base font-medium text-gray-900">
                            {personalStakeYes.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex flex-col items-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                            <span className="text-xs font-medium text-amber-700">
                              No Stake
                            </span>
                          </div>
                          <span className="text-base font-medium text-gray-900">
                            {personalStakeNo.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
