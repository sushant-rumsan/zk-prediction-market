"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { usePathname } from "next/navigation";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ExternalLink,
  HelpCircle,
  BookOpen,
  Shield,
  Award,
  BarChart2,
} from "lucide-react";

import "@demox-labs/aleo-wallet-adapter-reactui/dist/styles.css";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const pathname = usePathname();
  const { wallet } = useWallet();

  const resourcesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setResourcesOpen(false);
    setAboutOpen(false);
  }, [pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resourcesRef.current &&
        !resourcesRef.current.contains(event.target as Node)
      ) {
        setResourcesOpen(false);
      }
      if (
        aboutRef.current &&
        !aboutRef.current.contains(event.target as Node)
      ) {
        setAboutOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center">
              <div className="relative overflow-hidden rounded-lg mr-2 w-8 h-8 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 opacity-20"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
                  }}
                />
                <span className="text-white font-bold text-sm">AP</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-black bg-clip-text text-transparent">
                AleoPredict
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            className="hidden md:flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mr-2 bg-gray-50 rounded-full p-0.5 border border-gray-100 flex">
              <NavLink href="/" active={pathname === "/"}>
                Home
              </NavLink>
              <NavLink href="/#events" active={pathname?.includes("/events")}>
                Predict an Event
              </NavLink>
              {wallet && (
                <NavLink href="/profile" active={pathname === "/profile"}>
                  Profile
                </NavLink>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative" ref={resourcesRef}>
              <button
                onClick={() => {
                  setResourcesOpen(!resourcesOpen);
                  setAboutOpen(false);
                }}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
              >
                Resources
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform ${
                    resourcesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {resourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-50"
                  >
                    <div className="py-1">
                      <DropdownLink
                        href="#"
                        icon={<BookOpen className="h-4 w-4" />}
                      >
                        Documentation
                      </DropdownLink>
                      <DropdownLink
                        href="#"
                        icon={<HelpCircle className="h-4 w-4" />}
                      >
                        Tutorials
                      </DropdownLink>
                      <DropdownLink
                        href="https://aleo.org"
                        external
                        icon={<ExternalLink className="h-4 w-4" />}
                      >
                        Aleo Platform
                      </DropdownLink>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* About Dropdown */}
            <div className="relative mr-2" ref={aboutRef}>
              <button
                onClick={() => {
                  setAboutOpen(!aboutOpen);
                  setResourcesOpen(false);
                }}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
              >
                About
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform ${
                    aboutOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {aboutOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-50"
                  >
                    <div className="py-1">
                      <DropdownLink
                        href="#"
                        icon={<Shield className="h-4 w-4" />}
                      >
                        Our Mission
                      </DropdownLink>
                      <DropdownLink
                        href="#"
                        icon={<Award className="h-4 w-4" />}
                      >
                        Team
                      </DropdownLink>
                      <DropdownLink
                        href="#"
                        icon={<BarChart2 className="h-4 w-4" />}
                      >
                        Platform Statistics
                      </DropdownLink>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <WalletMultiButton
                style={{
                  background: "linear-gradient(to right, #1f2937, #000000)",
                  borderRadius: "0.75rem",
                  padding: "0.5rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "white",
                  border: "none",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  transition: "all 200ms ease",
                }}
              />
            </div>
          </motion.nav>

          {/* Mobile Controls */}
          <div className="flex items-center gap-3 md:hidden">
            <WalletMultiButton
              style={{
                background: "linear-gradient(to right, #1f2937, #000000)",
                borderRadius: "0.75rem",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "white",
                border: "none",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                transition: "all 200ms ease",
              }}
            />
            <button
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-5">
                <span
                  className={`absolute left-0 block w-full h-0.5 bg-gray-800 transform transition-all duration-300 ease-in-out ${
                    isOpen ? "top-2 rotate-45" : "top-0"
                  }`}
                ></span>
                <span
                  className={`absolute left-0 block w-full h-0.5 bg-gray-800 top-2 transition-all duration-200 ${
                    isOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`absolute left-0 block w-full h-0.5 bg-gray-800 transform transition-all duration-300 ease-in-out ${
                    isOpen ? "top-2 -rotate-45" : "top-4"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        className="md:hidden overflow-hidden"
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        <div className="px-4 py-3 space-y-1 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm">
          <MobileNavLink href="/" active={pathname === "/"}>
            Home
          </MobileNavLink>
          <MobileNavLink href="/#events" active={pathname?.includes("/events")}>
            Predict an Event
          </MobileNavLink>
          {wallet && (
            <MobileNavLink href="/profile" active={pathname === "/profile"}>
              Profile
            </MobileNavLink>
          )}

          {/* Mobile Resources Section */}
          <div className="mt-2 pt-2 border-t border-gray-200/50">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Resources
            </p>
            <MobileNavLink href="#">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </MobileNavLink>
            <MobileNavLink href="#">
              <HelpCircle className="h-4 w-4 mr-2" />
              Tutorials
            </MobileNavLink>
            <MobileNavLink href="https://aleo.org">
              <ExternalLink className="h-4 w-4 mr-2" />
              Aleo Platform
            </MobileNavLink>
          </div>

          {/* Mobile About Section */}
          <div className="mt-2 pt-2 border-t border-gray-200/50">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              About
            </p>
            <MobileNavLink href="#">
              <Shield className="h-4 w-4 mr-2" />
              Our Mission
            </MobileNavLink>
            <MobileNavLink href="#">
              <Award className="h-4 w-4 mr-2" />
              Team
            </MobileNavLink>
            <MobileNavLink href="#">
              <BarChart2 className="h-4 w-4 mr-2" />
              Platform Statistics
            </MobileNavLink>
          </div>
        </div>
      </motion.div>

      {/* Status Indicator */}
      <div className="hidden md:block absolute top-16 right-4">
        <div className="flex items-center bg-gray-50 rounded-b-lg px-3 py-1 text-xs font-medium text-gray-600 border-x border-b border-gray-200/50 shadow-sm">
          <span className="flex h-2 w-2 relative mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Network: Testnet
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-1.5 text-sm font-medium transition-all duration-200 relative ${
        active
          ? "text-white bg-gradient-to-r from-gray-800 to-black rounded-full"
          : "text-gray-700 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-gray-800 to-black text-white shadow-sm"
          : "text-gray-700 hover:bg-white hover:shadow-sm"
      }`}
    >
      {children}
    </Link>
  );
}

function DropdownLink({
  href,
  children,
  icon,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
    >
      {icon && <span className="mr-3 text-gray-500">{icon}</span>}
      {children}
      {external && (
        <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-400" />
      )}
    </Link>
  );
}
