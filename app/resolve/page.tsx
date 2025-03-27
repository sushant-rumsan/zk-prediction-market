"use client";

import { useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import {
  Transaction,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
import { BLOCKCHAIN } from "@/constants/blockchain";
import { Navbar } from "@/components/navbar";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Gavel,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Info,
  Lock,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
} from "lucide-react";
import { useResolveEvent } from "@/hooks/api-hooks";

export default function ResolveEventPage() {
  const { publicKey, requestTransaction } = useWallet();
  const [eventId, setEventId] = useState<string>("");
  const [outcome, setOutcome] = useState<boolean>(true); // True for Yes, False for No
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const { mutate } = useResolveEvent();

  const validateInputs = (): boolean => {
    if (!eventId.trim()) {
      setError("Event ID is required");
      return false;
    }
    return true;
  };

  const handleResolveEvent = async () => {
    if (!publicKey || !requestTransaction) {
      setError("Please connect your wallet");
      return;
    }

    if (process.env.NEXT_PUBLIC_APP_ADMIN != publicKey) {
      setError("Only Admin can Resolve event");
      return;
    }

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setError(null);
    setTxId(null);
    setSuccess(false);

    try {
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        BLOCKCHAIN.PROGRAM_ID,
        "resolve_event",
        [
          `${eventId}field`, // Event ID as field
          outcome ? "true" : "false", // Outcome as bool
        ],
        1_000_000 // Fee in microcredits
      );

      const transactionId = await requestTransaction(aleoTransaction);

      mutate(+eventId);
      setTxId(transactionId);
      setSuccess(true);
      console.log("Resolve Event Transaction ID:", transactionId);
    } catch (err) {
      setError(
        `Failed to resolve event: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 pt-10 pb-12 relative z-10">
        <div className="mb-6">
          <Link
            href="/create"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-sm">Back to Create</span>
          </Link>
        </div>

        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center justify-center mb-4 p-2 rounded-full bg-gray-50 border border-gray-100"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center text-white">
                <Gavel className="h-5 w-5" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-medium text-gray-900 mb-2">
              Resolve Event
            </h1>
            <p className="text-gray-600 text-sm">
              <span className="inline-flex items-center bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                <Lock className="h-3 w-3 mr-1" />
                Admin Only
              </span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="eventId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Event ID
                  </label>
                  <input
                    type="text"
                    id="eventId"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    placeholder="e.g., 123"
                    disabled={loading}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all hover:border-gray-300"
                  />
                </div>

                <div>
                  <label
                    htmlFor="outcome"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Outcome
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setOutcome(true)}
                      className={`px-3 py-2.5 rounded-xl text-sm flex items-center justify-center transition-all ${
                        outcome
                          ? "bg-green-500 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <ThumbsUp className="mr-1.5 h-4 w-4" />
                      Yes Wins
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutcome(false)}
                      className={`px-3 py-2.5 rounded-xl text-sm flex items-center justify-center transition-all ${
                        !outcome
                          ? "bg-rose-500 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <ThumbsDown className="mr-1.5 h-4 w-4" />
                      No Wins
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      Resolving an event is final and cannot be undone. This
                      will determine the outcome and allow users to claim their
                      rewards.
                    </p>
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
                            Admin Wallet Not Connected
                          </h3>
                          <p className="text-xs text-amber-700 mt-0.5">
                            Please connect your admin wallet to resolve events.
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
                            Event Resolved Successfully!
                          </h3>
                          <p className="text-xs text-green-700 mt-0.5">
                            The event has been resolved on the blockchain.
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
                  onClick={handleResolveEvent}
                  disabled={!publicKey || loading}
                  className="w-full py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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
                      Resolving Event...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center cursor-pointer">
                      <Gavel className="mr-2 h-4 w-4" />
                      Resolve Event
                    </div>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/events"
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-full hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
