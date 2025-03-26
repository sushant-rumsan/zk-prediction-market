"use client";

import { useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import {
  Transaction,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
import { BLOCKCHAIN } from "@/constants/blockchain";
import { useCreateEvent, useUpdateEvent } from "@/hooks/api-hooks";
import { Navbar } from "@/components/navbar";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Settings,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  PlusCircle,
  Play,
  Info,
} from "lucide-react";

export default function CreateEventPage() {
  const { publicKey, requestTransaction } = useWallet();
  const [eventName, setEventName] = useState("");
  const [eventDetail, setEventDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const { mutateAsync: mutateCreate } = useCreateEvent();
  const { mutate: mutateUpdate } = useUpdateEvent();

  const handleCreateEvent = async () => {
    if (!publicKey || !requestTransaction) {
      setError("Wallet not connected or requestTransaction not available");
      return;
    }

    if (process.env.NEXT_PUBLIC_APP_ADMIN != publicKey) {
      setError("Only Admin can create event");
      return;
    }

    if (!eventName || !eventDetail) {
      setError("Please enter an Event Name and Detail");
      return;
    }

    setLoading(true);
    setError(null);
    setTxId(null);
    setSuccess(false);

    try {
      mutateCreate({ eventName, eventDetail })
        .then(async (res: any) => {
          const eventId = res.res.id;
          const aleoTransaction = Transaction.createTransaction(
            publicKey,
            WalletAdapterNetwork.TestnetBeta,
            BLOCKCHAIN.PROGRAM_ID,
            "create_event",
            [eventId + "field"],
            1_000_000
          );
          const result = await requestTransaction(aleoTransaction);

          console.log(result, "is result from puzzle");
          setTxId(result);

          if (result) {
            mutateUpdate({ id: eventId });
            setSuccess(true);
          }
        })
        .catch((error) => {
          setError("Couldn't create event in DB");
        });
    } catch (err) {
      setError(
        `Failed to create event: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpause = async () => {
    if (!publicKey || !requestTransaction) {
      setError("Please connect your wallet");
      return;
    }

    setLoading(true);
    setError(null);
    setTxId(null);

    try {
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        "Testnet",
        BLOCKCHAIN.PROGRAM_ID,
        "unpause",
        [], // No inputs for unpause
        1_000_000
      );

      const transactionId = await requestTransaction(aleoTransaction);
      setTxId(transactionId);
      console.log("Unpause Transaction ID:", transactionId);
    } catch (err) {
      setError(
        `Failed to unpause: ${
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

      <main className="container mx-auto px-4 pt-10 pb-12 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-medium text-gray-900">
              Create New Event
            </h1>
            <p className="mt-3 text-gray-600">
              Create a new blockchain-powered prediction event for your
              community
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8 shadow-sm">
            <div className="flex">
              <button
                onClick={() => setActiveTab("create")}
                className={`flex-1 py-3 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "create"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Create Event</span>
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex-1 py-3 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "admin"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Admin Actions</span>
              </button>
            </div>

            <div className="p-6">
              {activeTab === "create" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Event Details
                    </h2>
                  </div>

                  <div>
                    <label
                      htmlFor="eventName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Event Name
                    </label>
                    <input
                      type="text"
                      id="eventName"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="e.g., Bitcoin Price Prediction 2025"
                      disabled={loading}
                      className="w-full px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="eventDetail"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Event Description
                    </label>
                    <textarea
                      id="eventDetail"
                      value={eventDetail}
                      onChange={(e) => setEventDetail(e.target.value)}
                      placeholder="Describe your event in detail. For example: Will Bitcoin exceed $100,000 by the end of 2025?"
                      disabled={loading}
                      rows={4}
                      className="w-full px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors"
                    />
                  </div>

                  <div className="p-4 rounded-md bg-gray-50 border border-gray-100">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        Events should have clear, verifiable outcomes. Once
                        created, users can stake on whether they believe the
                        outcome will be "Yes" or "No".
                      </p>
                    </div>
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
                              Please connect your wallet to create an event.
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
                              Event Created Successfully!
                            </h3>
                            <p className="text-xs text-green-700 mt-0.5">
                              Your event has been created on the blockchain.
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
                    onClick={handleCreateEvent}
                    disabled={
                      !publicKey || loading || !eventName || !eventDetail
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
                        Creating Event...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Event
                      </div>
                    )}
                  </button>
                </div>
              )}

              {activeTab === "admin" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white">
                      <Settings className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Admin Actions
                    </h2>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-5 bg-white">
                    <h3 className="font-medium text-base text-gray-900 mb-2">
                      Unpause Events
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Resume event creation and participation if it was paused.
                    </p>

                    <div className="p-4 rounded-md bg-gray-50 border border-gray-100 mb-4">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-600">
                          This action requires admin privileges. It will allow
                          users to create and participate in events again if the
                          system was previously paused.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleUnpause}
                      disabled={!publicKey || loading}
                      className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-1 focus:ring-gray-800 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="flex items-center">
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
                        <div className="flex items-center">
                          <Play className="mr-2 h-4 w-4" />
                          Unpause Events
                        </div>
                      )}
                    </button>
                  </div>

                  {txId && (
                    <div className="rounded-md bg-green-50 border border-green-200 p-3 text-green-800">
                      <div className="flex">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="ml-2">
                          <h3 className="text-xs font-medium text-green-800">
                            Action Completed Successfully
                          </h3>
                          <p className="text-xs text-green-700 mt-0.5">
                            The unpause action has been submitted to the
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
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/events"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Events
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
