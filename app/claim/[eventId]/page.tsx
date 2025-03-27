"use client";

import { useDokoJsWASM } from "@/hooks/useDokojs";
import { getEvents } from "@/utils/getEvents";
import {
  ALGORITHM,
  OUTPUT_TYPE,
  toLeoStakeRecord,
} from "@/utils/getUserStakeKey";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import {
  Transaction,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { BLOCKCHAIN } from "@/constants/blockchain";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Info,
  TrendingUp,
  Shield,
  Coins,
} from "lucide-react";

export default function ClaimPrize() {
  const UserStakeEventKey = "user_stake";
  const EventEventKey = "events";
  const { publicKey, requestTransaction } = useWallet();
  const [userTotalStake, setUserTotalStake] = useState<string>("");
  const [claimAmount, setClaimAmount] = useState<string>("");
  const [dokoJsWasm] = useDokoJsWASM();
  const [loading, setLoading] = useState<boolean>(false);
  const [event, setEvent] = useState<any>();
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [eventLoading, setEventLoading] = useState<boolean>(true);

  console.log(event);
  console.log(userTotalStake);

  const params = useParams();
  const eventId = params?.eventId as string;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw donut chart
  useEffect(() => {
    if (!event) return;

    const drawDonutChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = 300;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size * 0.4;
      const strokeWidth = size * 0.08;

      // Draw background circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#f3f4f680";
      ctx.lineWidth = strokeWidth;
      ctx.stroke();

      // Calculate percentages
      const totalYesStake = Number.parseInt(event.total_yes_stake, 10);
      const totalNoStake = Number.parseInt(event.total_no_stake, 10);
      const totalStake = totalYesStake + totalNoStake;

      const yesPercentage =
        totalStake > 0 ? (totalYesStake / totalStake) * 100 : 50;
      const noPercentage =
        totalStake > 0 ? (totalNoStake / totalStake) * 100 : 50;

      // Draw "No" segment (red)
      if (noPercentage > 0) {
        const noAngle = (noPercentage / 100) * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + noAngle);

        // Create gradient for "No" segment
        const noGradient = ctx.createLinearGradient(0, 0, size, size);
        noGradient.addColorStop(0, "#f43f5e"); // rose-500
        noGradient.addColorStop(1, "#e11d48"); // rose-600

        ctx.strokeStyle = noGradient;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }

      // Draw "Yes" segment (green)
      if (yesPercentage > 0) {
        const yesAngle = (yesPercentage / 100) * 2 * Math.PI;
        const startAngle = -Math.PI / 2 + (noPercentage / 100) * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + yesAngle);

        // Create gradient for "Yes" segment
        const yesGradient = ctx.createLinearGradient(0, 0, size, size);
        yesGradient.addColorStop(0, "#22c55e"); // green-500
        yesGradient.addColorStop(1, "#16a34a"); // green-600

        ctx.strokeStyle = yesGradient;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }

      // Draw center circle with gradient
      const centerGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius - strokeWidth
      );
      centerGradient.addColorStop(0, "#ffffff");
      centerGradient.addColorStop(1, "#f9fafb");

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - strokeWidth / 2, 0, 2 * Math.PI);
      ctx.fillStyle = centerGradient;
      ctx.fill();

      // Draw text in center - show the winning outcome
      ctx.font = "bold 28px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#111827";

      const outcomeText = event.outcome ? "YES" : "NO";
      const outcomeColor = event.outcome ? "#16a34a" : "#e11d48";

      ctx.fillStyle = outcomeColor;
      ctx.fillText(outcomeText, centerX, centerY);

      ctx.font = "14px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText("OUTCOME", centerX, centerY + 24);
    };

    drawDonutChart();

    // Redraw on window resize
    window.addEventListener("resize", drawDonutChart);
    return () => window.removeEventListener("resize", drawDonutChart);
  }, [event]);

  const getUserTotalStake = async (hash: string) => {
    try {
      const totalStake = await getEvents(UserStakeEventKey, hash);
      setUserTotalStake(totalStake);
    } catch (err) {
      console.error("Failed to get user stake:", err);
      setUserTotalStake("0u64");
    } finally {
      setLoading(false);
    }
  };

  const getEventDetail = async () => {
    setEventLoading(true);
    try {
      const data = await getEvents(EventEventKey, eventId);
      if (data === "None") {
        setError("Event not found or not yet confirmed on blockchain");
        return;
      }

      setEvent(data);
    } catch (err) {
      console.error("Failed to fetch event details:", err);
      setError("Failed to load event details");
    } finally {
      setEventLoading(false);
    }
  };

  const handleClaim = async () => {
    if (
      !publicKey ||
      !requestTransaction ||
      !event?.resolved ||
      !userTotalStake
    ) {
      setError(
        "Cannot claim: Wallet not connected, event not resolved, or no stake."
      );
      return;
    }

    const stakeNum = Number.parseInt(userTotalStake);
    const claimNum = claimAmount ? Number.parseInt(claimAmount, 10) : 0;

    if (!claimAmount || claimNum <= 0 || claimNum > stakeNum) {
      setError(`Claim amount must be between 1 and ${stakeNum}`);
      return;
    }

    setLoading(true);
    setError(null);
    setTxId(null);
    setSuccess(false);

    try {
      const amount = `${claimNum}u64`; // Format for Leo
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        BLOCKCHAIN.PROGRAM_ID,
        "claim_public",
        [`${eventId}field`, amount],
        1_000_000 // Fee in microcredits
      );

      const transactionId = await requestTransaction(aleoTransaction);
      setTxId(transactionId);
      setSuccess(true);
      console.log("Claim Transaction ID:", transactionId);
    } catch (err) {
      setError(
        `Failed to claim: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      setLoading(true);
      if (!dokoJsWasm) {
        return;
      }
      const message = toLeoStakeRecord(eventId, publicKey);
      const hash = dokoJsWasm.Hasher.hash(
        ALGORITHM,
        message,
        OUTPUT_TYPE,
        "testnet"
      );
      getUserTotalStake(hash);
    }
  }, [publicKey, dokoJsWasm, eventId]);

  useEffect(() => {
    getEventDetail();
  }, [eventId]);

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

  // Format stake amount for display
  const formatStake = (stake: string) => {
    if (!stake) return "0";
    return Number.parseInt(stake).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 pt-10 pb-12 relative z-10">
        <div className="mb-6">
          <Link
            href={`/stake/${eventId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-sm">Back to Event</span>
          </Link>
        </div>

        {eventLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        ) : error && !event ? (
          <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Event Not Found
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              href="/events"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-black transition-colors"
            >
              View All Events
            </Link>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Left column - Claim Form */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="h-5 w-5 text-gray-700" />
                  <h2 className="text-base font-medium text-gray-900">
                    Claim Your Reward
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-md bg-gray-50 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      Your Stake Details
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-md p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="h-2 w-2 rounded-full bg-gray-800"></div>
                          <span className="text-xs font-medium text-gray-700">
                            Your Stake
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 font-medium">
                          {formatStake(userTotalStake)} credits
                        </span>
                      </div>

                      <div className="bg-white rounded-md p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              event?.outcome ? "bg-green-500" : "bg-rose-500"
                            }`}
                          ></div>
                          <span className="text-xs font-medium text-gray-700">
                            Outcome
                          </span>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            event?.outcome ? "text-green-600" : "text-rose-600"
                          }`}
                        >
                          {event?.outcome ? "YES" : "NO"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {event?.resolved ? (
                    <>
                      <div>
                        <label
                          htmlFor="claimAmount"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Claim Amount (microcredits)
                        </label>
                        <div className="relative">
                          <input
                            id="claimAmount"
                            type="number"
                            value={claimAmount}
                            onChange={(e) => setClaimAmount(e.target.value)}
                            placeholder="e.g., 1000000"
                            min="1"
                            max={userTotalStake}
                            disabled={loading}
                            className="w-full px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 flex items-center">
                          <Info className="mr-1 h-3 w-3" />
                          Maximum: {formatStake(userTotalStake)} microcredits
                        </p>
                      </div>

                      <AnimatePresence>
                        {!publicKey && (
                          <motion.div
                            className="rounded-md bg-amber-50 border border-amber-200 p-3 text-amber-800"
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
                                  Please connect your wallet to claim your
                                  reward.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {error && (
                          <motion.div
                            className="rounded-md bg-red-50 border border-red-200 p-3 text-red-800"
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
                                <p className="text-xs text-red-700 mt-0.5">
                                  {error}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {txId && success && (
                          <motion.div
                            className="rounded-md bg-green-50 border border-green-200 p-3 text-green-800"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="flex">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <div className="ml-2">
                                <h3 className="text-xs font-medium text-green-800">
                                  Claim Submitted Successfully
                                </h3>
                                <p className="text-xs text-green-700 mt-0.5">
                                  Your claim has been submitted to the
                                  blockchain.
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

                      <button
                        onClick={handleClaim}
                        disabled={
                          !publicKey ||
                          loading ||
                          !userTotalStake ||
                          userTotalStake === "0u64"
                        }
                        className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-1 focus:ring-gray-800 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                            <Coins className="mr-2 h-4 w-4" />
                            Claim Reward
                          </div>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-amber-800">
                            Event Not Resolved
                          </h3>
                          <p className="text-sm text-amber-700 mt-1">
                            This event has not been resolved yet. Once the event
                            is resolved, you'll be able to claim your reward if
                            you predicted correctly.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column - Event Info and Chart */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="h-5 w-5 text-gray-700" />
                  <h2 className="text-base font-medium text-gray-900">
                    Event #{eventId} Results
                  </h2>
                </div>

                <div className="mb-6">
                  <div className="p-4 rounded-md bg-gray-50 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {event?.eventName || "Event Details"}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      {event?.eventDetail || "Event description not available"}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-white rounded-md p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-xs font-medium text-gray-700">
                            Total Yes Stake
                          </span>
                        </div>
                        <span className="text-xs text-gray-900">
                          {formatStake(event?.total_yes_stake || "0u64")}{" "}
                          credits
                        </span>
                      </div>

                      <div className="bg-white rounded-md p-3 border border-gray-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                          <span className="text-xs font-medium text-gray-700">
                            Total No Stake
                          </span>
                        </div>
                        <span className="text-xs text-gray-900">
                          {formatStake(event?.total_no_stake || "0u64")} credits
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Final Outcome
                  </h3>

                  <div className="grid grid-cols-2 gap-6 w-full max-w-xs">
                    <div className="flex flex-col items-center p-3 rounded-md bg-green-50 border border-green-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-xs font-medium text-green-700">
                          Yes
                        </span>
                      </div>
                      <span className="text-base font-medium text-gray-900">
                        {formatStake(event?.total_yes_stake || "0u64")}
                      </span>
                    </div>

                    <div className="flex flex-col items-center p-3 rounded-md bg-rose-50 border border-rose-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                        <span className="text-xs font-medium text-rose-700">
                          No
                        </span>
                      </div>
                      <span className="text-base font-medium text-gray-900">
                        {formatStake(event?.total_no_stake || "0u64")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    About Claiming
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        When an event is resolved, participants who predicted
                        correctly can claim their rewards.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        Rewards are calculated based on your stake amount and
                        the total distribution of stakes.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        All claims are processed on the blockchain using
                        zero-knowledge technology, ensuring transparency and
                        privacy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
