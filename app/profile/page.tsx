"use client";

import { useGetStakesByPublicKey } from "@/hooks/api-hooks";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const { data, isLoading, error } = useGetStakesByPublicKey(publicKey);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <motion.div
        className="container mx-auto max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            className="text-3xl font-bold text-gray-900 truncate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            title={publicKey || "Your Profile"}
          >
            {publicKey
              ? `Profile: ${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`
              : "Your Profile"}
          </motion.h1>
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Profile Card */}
        <motion.div
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Wallet Details
              </h2>
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Connection Status:</span>{" "}
                {publicKey ? (
                  <span className="font-mono">Connected</span>
                ) : (
                  "Not connected"
                )}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                <span className="font-medium">Stakes:</span>{" "}
                {data?.res?.length || 0} total
              </p>
            </div>
            {publicKey && (
              <Link href="/events">
                <motion.button
                  className="px-6 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-800 transition-all shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Events
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stakes Section */}
        <motion.div
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Stakes
          </h2>
          {isLoading ? (
            <div className="text-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-gray-600 mx-auto"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-gray-600 text-sm mt-2">Loading stakes...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 text-center">
              <span className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                Error: {error.message}
              </span>
            </div>
          ) : !publicKey ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700 text-center">
              <span className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" x2="12" y1="9" y2="13" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
                Connect wallet to view stakes
              </span>
            </div>
          ) : !data?.res || data.res.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-700"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Stakes Found
              </h3>
              <p className="text-gray-600 text-sm">
                You haven’t placed any stakes yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {data.res.map((stake: any) => (
                <motion.div
                  key={stake.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">
                        Event #{stake.eventId}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stake.isChainSuccess
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {stake.isChainSuccess ? "Confirmed" : "Pending"}
                      </span>
                    </div>
                    <p>
                      <span className="font-medium">Stake Key:</span>{" "}
                      <span className="font-mono text-xs">
                        {stake.stakeKey.slice(0, 10)}...
                        {stake.stakeKey.slice(-4)}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Prediction:</span>{" "}
                      {stake.stakeAmountYes !== "0" ? "Yes" : "No"} (
                      {stake.stakeAmountYes !== "0"
                        ? stake.stakeAmountYes
                        : stake.stakeAmountNo}{" "}
                      microcredits)
                    </p>
                    <p>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(stake.createdAt).toLocaleDateString()}
                    </p>
                    <Link href={`/claim/${stake.eventId}`}>
                      <button className="w-full mt-2 cursor-pointer py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                        Claim
                      </button>
                    </Link>
                    <Link href={`/stake/${stake.eventId}`}>
                      <button className="w-full mt-2 cursor-pointer py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors">
                        Stake More
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
