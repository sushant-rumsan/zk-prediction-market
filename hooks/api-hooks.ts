"use client";

import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";

// Events Utility
export const createEvent = async (data: any) => {
  const { eventName, eventDetail } = data;
  const res = await axios.post("/api/events", {
    eventName,
    eventDetail,
  });

  return res.data;
};

export const updateEvent = async (data: any) => {
  const { id } = data;
  const res = await axios.patch("/api/events", { id });

  return res.data;
};

export const getEvents = async () => {
  const res = await axios.get("/api/events");
  return res.data;
};

// Stake events Utility
export const createStake = async (data: any) => {
  const { publicKey, eventId, stakeKey, stakeAmountYes, stakeAmountNo } = data;
  const res = await axios.post("/api/stake", {
    publicKey,
    eventId,
    stakeKey,
    stakeAmountYes,
    stakeAmountNo,
  });

  return res.data;
};

export const getStakeDetail = async (publicKey: string, eventId: number) => {
  const res = await axios.get(
    `/api/stake/event?publicKey=${publicKey}&eventId=${eventId}`
  );
  return res.data;
};

export const resolveEvent = async (eventId: number) => {
  const res = await axios.patch("/api/events/resolve", { eventId });
  return res.data;
};

// Events Hooks
export const useCreateEvent = () => {
  return useMutation({
    mutationFn: createEvent,
  });
};

export const useUpdateEvent = () => {
  return useMutation({
    mutationFn: updateEvent,
  });
};

export const useGetEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });
};

// Stake hooks
export const useCreateStake = () => {
  return useMutation({
    mutationFn: createStake,
  });
};

// New hook for recently created event
export const useGetStakesByPublicKey = (publicKey: string | null) => {
  return useQuery({
    queryKey: ["stakes", publicKey],
    queryFn: async () => {
      if (!publicKey) throw new Error("publicKey is required");
      const res = await axios.get(`/api/stake?publicKey=${publicKey}`);
      return res.data;
    },
    enabled: !!publicKey,
  });
};

export const useGetEventByEventID = (eventId: string | null) => {
  return useQuery({
    queryKey: ["stakes", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("publicKey is required");
      const res = await axios.get(`/api/event?eventId=${eventId}`);
      return res.data;
    },
    enabled: !!eventId,
  });
};

export const useGetStakeDetail = (
  publicKey: string | null,
  eventId: number | null
) => {
  return useQuery({
    queryKey: ["stakeDetail", publicKey, eventId],
    queryFn: () => {
      if (!publicKey || !eventId)
        throw new Error("publicKey and eventId are required");
      return getStakeDetail(publicKey, eventId);
    },
    enabled: !!publicKey && !!eventId,
  });
};

export const useResolveEvent = () => {
  return useMutation({
    mutationFn: resolveEvent,
  });
};
