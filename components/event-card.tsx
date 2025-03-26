"use client";

import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { DonutChart } from "./donut-chart";
import { motion } from "framer-motion";
import { Clock, Tag, ExternalLink } from "lucide-react";

interface Event {
  id: number;
  eventId: number;
  eventName: string;
  eventDetail: string;
  isResolved: boolean;
  isChainSuccess: boolean;
  createdAt: string;
  updatedAt: string;
  totalYesVote?: number;
  totalNoVote?: number;
}

export function EventCard({ event }: { event: Event }) {
  const router = useRouter();

  // Calculate vote percentages
  const totalVotes = (event.totalYesVote || 0) + (event.totalNoVote || 0);
  const yesPercentage =
    totalVotes > 0 ? ((event.totalYesVote || 0) / totalVotes) * 100 : 50;
  const noPercentage =
    totalVotes > 0 ? ((event.totalNoVote || 0) / totalVotes) * 100 : 50;

  // Determine category based on event name (mock implementation)
  const getCategory = (eventName: string) => {
    if (
      eventName.toLowerCase().includes("bitcoin") ||
      eventName.toLowerCase().includes("ethereum")
    ) {
      return { name: "Cryptocurrency", color: "bg-indigo-100 text-indigo-800" };
    } else if (
      eventName.toLowerCase().includes("election") ||
      eventName.toLowerCase().includes("presidential")
    ) {
      return { name: "Politics", color: "bg-amber-100 text-amber-800" };
    } else if (
      eventName.toLowerCase().includes("ai") ||
      eventName.toLowerCase().includes("technology")
    ) {
      return { name: "Technology", color: "bg-emerald-100 text-emerald-800" };
    }
    return { name: "Other", color: "bg-gray-100 text-gray-800" };
  };

  const category = getCategory(event.eventName);

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col cursor-pointer group"
      onClick={() => router.push(`/stake/${event.eventId}`)}
    >
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-indigo-700 transition-colors">
            {event.eventName}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${category.color}`}
            >
              {category.name}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                !event.isResolved
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-gray-800"
              }`}
            >
              {!event.isResolved ? "Active" : "Resolved"}
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {event.eventDetail}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
            {formatDistanceToNow(new Date(event.createdAt), {
              addSuffix: true,
            })}
          </div>
          <div className="flex items-center">
            <Tag className="h-3.5 w-3.5 mr-1 text-gray-400" />
            ID: {event.eventId}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
          <div className="flex items-center gap-2">
            <DonutChart
              yesPercentage={yesPercentage}
              noPercentage={noPercentage}
              size={40}
            />
            <div className="text-xs">
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                <span className="text-gray-600">
                  Yes: {totalVotes > 0 ? Math.round(yesPercentage) : 0}%
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                <span className="text-gray-600">
                  No: {totalVotes > 0 ? Math.round(noPercentage) : 0}%
                </span>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/stake/${event.eventId}`);
            }}
          >
            Participate
            <ExternalLink className="ml-1 h-3 w-3" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
