import { useNavigate } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigate = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <footer className="bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Info Section */}
        <div>
          <h3 className="font-bold text-lg mb-3">Info</h3>
          <ul className="space-y-1.5">
            <li>
              <a
                href="#"
                onClick={(e) => handleNavigate(e, "/search")}
                className="text-base text-gray-600 hover:text-gray-900 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-gray-500"
              >
                Search
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => handleNavigate(e, "/contact")}
                className="text-base text-gray-600 hover:text-gray-900 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-gray-500"
              >
                Contact Information
              </a>
            </li>
          </ul>

          <h3 className="font-bold text-base mt-6 mb-3">
            Subscribe to our emails
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Subscribed:", e.target[0].value);
            }}
            className="flex"
          >
            <input
              type="email"
              placeholder="Email"
              className="flex-grow rounded-l-full border border-gray-300 px-3 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Email for subscription"
            />
            <button
              type="submit"
              className="bg-gray-200 rounded-r-full px-3 py-1.5 text-base hover:bg-gray-300 focus-visible:ring-2 focus-visible:ring-gray-500 transition-colors duration-200"
              aria-label="Subscribe"
            >
              →
            </button>
          </form>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="font-bold text-lg mb-3">Contact Us</h3>
          <div className="space-y-1.5">
            <p className="text-base text-gray-600">
              Phone/WhatsApp:{" "}
              <a
                href="tel:+94743654483"
                className="text-blue-600 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Call or WhatsApp +94 74 365 4483"
              >
                +94 74 365 4483
              </a>
            </p>
            <p className="text-lg text-gray-600">
              Email:{" "}
              <a
                href="mailto:support@farmfresh.com"
                className="text-blue-600 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Email support@farmfresh.com"
              >
                support@farmfresh.com
              </a>
            </p>
          </div>

          <div className="mt-6 flex space-x-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Visit our Facebook page"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-600 focus-visible:ring-2 focus-visible:ring-pink-500"
              aria-label="Visit our Instagram page"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>

        {/* Mission Section */}
        <div>
          <h3 className="font-bold text-lg mb-3">Our Mission</h3>
          <p className="text-base text-gray-600">
            To bring the highest quality, freshest fruits and vegetables
            straight from the farms to your doorstep.
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>© 2025, Farm Fresh, Designed by Agaxe Startups</p>
        <ul className="flex flex-wrap justify-center space-x-3 mt-1.5">
          {[
            { label: "Refund policy", path: "/refund-policy" },
            { label: "Privacy policy", path: "/privacy-policy" },
            { label: "Terms of service", path: "/terms-of-service" },
            { label: "Shipping policy", path: "/shipping-policy" },
            { label: "Contact information", path: "/contact" },
          ].map((item) => (
            <li key={item.label}>
              <a
                href="#"
                onClick={(e) => handleNavigate(e, item.path)}
                className="text-sm hover:text-gray-900 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-gray-500"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
