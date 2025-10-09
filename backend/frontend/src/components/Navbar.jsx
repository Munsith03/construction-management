import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { useCart } from "../contexts/cartContext";
import { LogOut, ShoppingCart } from "lucide-react";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const cartCount = Array.isArray(cart?.items)
    ? cart.items.reduce((n, it) => n + (it.quantity || 1), 0)
    : 0;

  // Scroll hide + shadow
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsVisible(y <= lastScrollY || y <= 50);
      setLastScrollY(y);
      setScrolled(y > 8);
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setIsDesktopDropdownOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [lastScrollY]);

  // Click outside to close desktop dropdown
  useEffect(() => {
    const onDocClick = (e) => {
      if (
        isDesktopDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsDesktopDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isDesktopDropdownOpen]);

  // Desktop dropdown hover
  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setIsDesktopDropdownOpen(true);
  };
  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(
      () => setIsDesktopDropdownOpen(false),
      120
    );
  };
  const handleDropdownClick = () => setIsDesktopDropdownOpen((prev) => !prev);

  const navigateAndClose = (path) => {
    if (path === "logout") {
      logout();
      path = "/";
    }
    navigate(path);
    setMenuOpen(false);
    setIsDesktopDropdownOpen(false);
  };

  const MenuItem = ({ path, label, isButton, isLogout, isMobile }) => (
    <button
      onClick={() => navigateAndClose(isLogout ? "logout" : path)}
      className={
        isButton
          ? `px-3 py-1.5 rounded-full bg-neutral-900 text-white text-sm font-medium hover:opacity-90 ${
              isMobile ? "w-full" : ""
            }`
          : `text-sm font-medium text-neutral-700 hover:text-neutral-900 ${
              isMobile ? "w-full text-left py-2" : ""
            }`
      }
      aria-label={isLogout ? "Sign out" : label}
    >
      <span className="inline-flex items-center gap-2">
        {isLogout && <LogOut size={16} aria-hidden="true" />}
        {label}
      </span>
    </button>
  );

  const DropdownItem = ({ label, path }) => (
    <button
      onClick={() => navigateAndClose(path)}
      className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-100 focus:outline-none focus:bg-neutral-100"
      role="menuitem"
    >
      {label}
    </button>
  );

  const menuItems = [
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
    {
      label: "More",
      isDropdown: true,
      submenu: [
        { label: "Add your restaurant", path: "/add-restaurant" },
        { label: "Sign up to deliver", path: "/more/purchases" },
      ],
    },
    ...(isAuthenticated
      ? [
          { path: "/profile", label: "Profile" },
          { path: "/dashboard", label: "Dashboard" },
          { path: "logout", label: "Sign Out", isLogout: true },
        ]
      : [
          { path: "/signup", label: "Sign Up" },
          { path: "/login", label: "Login", isButton: true },
        ]),
  ];

  return (
    <nav
      className={[
        "fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        "transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full",
        scrolled ? "shadow-sm" : "",
      ].join(" ")}
      role="navigation"
      aria-label="Primary"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <button
            onClick={() => navigateAndClose("/")}
            className="flex items-center gap-2"
            aria-label="PickMyFood home"
          >
            <img src={logo} alt="" className="h-8 w-8 object-contain" />
            <span className="text-lg font-extrabold tracking-tight text-neutral-900">
              PickMyFood
            </span>
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item) =>
              item.isDropdown ? (
                <div
                  key={item.label}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={handleDropdownClick}
                    className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-neutral-900"
                    aria-haspopup="menu"
                    aria-expanded={isDesktopDropdownOpen}
                  >
                    {item.label}
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        isDesktopDropdownOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg ${
                      isDesktopDropdownOpen ? "block" : "hidden"
                    }`}
                    role="menu"
                  >
                    {item.submenu.map((s) => (
                      <DropdownItem key={s.path} {...s} />
                    ))}
                  </div>
                </div>
              ) : (
                <MenuItem key={item.path} {...item} />
              )
            )}

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative inline-flex items-center"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 text-neutral-700 hover:text-neutral-900" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-neutral-900 px-1.5 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="md:hidden inline-flex items-center rounded-md p-2 text-neutral-800 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile sheet + backdrop */}
      <div
        className={[
          "md:hidden fixed inset-0 z-40",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        {/* Backdrop */}
        <div
          className={[
            "absolute inset-0 bg-black/30 transition-opacity",
            menuOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        {/* Sheet */}
        <div
          className={[
            "absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-2xl",
            "transition-transform duration-300",
            menuOpen ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-200">
            <span className="text-sm font-semibold text-neutral-900">Menu</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="rounded-md p-2 text-neutral-700 hover:bg-neutral-100"
              aria-label="Close menu"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="px-4 py-4 space-y-2">
            {menuItems.map((item) =>
              item.isDropdown ? (
                item.submenu.map((s) => (
                  <MenuItem key={s.path} {...s} isMobile />
                ))
              ) : (
                <MenuItem key={item.path} {...item} isMobile />
              )
            )}

            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/cart");
              }}
              className="mt-2 inline-flex w-full items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            >
              <span>Cart</span>
              <span className="inline-flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
