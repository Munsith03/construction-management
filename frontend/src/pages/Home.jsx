import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Home,
  Wrench,
  Shield,
  Clock,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Menu,
  X,
  CheckCircle,
  Star,
  ArrowRight,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FiLogOut } from "react-icons/fi";
import AuthContext from "../context/AuthContext.jsx";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function App() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  // Check if user has "Super Admin" role
  const isSuperAdmin = user?.roles?.some((role) => role.name === "Super Admin");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F14] to-[#12161C] text-white">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#0B0F14]/95 backdrop-blur-sm shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-[#F5C242]">
              ConstrucEase
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("services")}
                className="hover:text-[#F5C242] transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("projects")}
                className="hover:text-[#F5C242] transition-colors"
              >
                Projects
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="hover:text-[#F5C242] transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="hover:text-[#F5C242] transition-colors"
              >
                FAQ
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="hover:text-[#F5C242] transition-colors"
              >
                Contact
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="hover:text-[#F5C242] transition-colors"
                >
                  Dashboard
                </button>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {/* Conditional Sign In/Sign Out Button */}
              <button
                onClick={user ? logout : () => navigate("/signin")}
                className="hidden md:inline-flex bg-[#F5C242] text-[#0B0F14] hover:bg-[#F5C242]/90 px-4 py-2 rounded-md font-medium items-center gap-2"
              >
                {user ? <FiLogOut size={20} /> : null}
                {user ? "Sign Out" : "Sign In"}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-white"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="md:hidden mt-4 pb-4 border-t border-white/10"
            >
              <div className="flex flex-col space-y-4 pt-4">
                <button
                  onClick={() => scrollToSection("services")}
                  className="text-left hover:text-[#F5C242] transition-colors"
                >
                  Services
                </button>
                <button
                  onClick={() => scrollToSection("projects")}
                  className="text-left hover:text-[#F5C242] transition-colors"
                >
                  Projects
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-left hover:text-[#F5C242] transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-left hover:text-[#F5C242] transition-colors"
                >
                  FAQ
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-left hover:text-[#F5C242] transition-colors"
                >
                  Contact
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="text-left hover:text-[#F5C242] transition-colors"
                  >
                    Dashboard
                  </button>
                )}
                <button
                  onClick={user ? logout : () => navigate("/signin")}
                  className="bg-[#F5C242] text-[#0B0F14] hover:bg-[#F5C242]/90 px-4 py-2 rounded-md font-medium w-full flex items-center justify-center gap-2"
                >
                  {user ? <FiLogOut size={20} /> : null}
                  {user ? "Sign Out" : "Sign In"}
                </button>
              </div>
            </motion.nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1655936072893-921e69ae9038?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwc3RlZWwlMjBmcmFtZSUyMGJ1aWxkaW5nfGVufDF8fHx8MTc1ODc3MjY0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Construction site"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F14]/90 via-[#0B0F14]/70 to-[#0B0F14]/50"></div>
        </div>

        <div className="container mx-auto px-4 z-10">
          <motion.div {...fadeInUp} className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              We Build Strong Foundations for Your Vision
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl">
              Award-winning construction company delivering exceptional
              commercial and residential projects with unmatched quality and
              precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={user ? logout : () => navigate("/signin")}
                className="bg-[#F5C242] text-[#0B0F14] hover:bg-[#F5C242]/90 px-8 py-4 rounded-md font-medium text-lg flex items-center justify-center"
              >
                {user ? "Sign Out" : "Sign In"}
                <ArrowRight className="ml-2" size={20} />
              </button>
              <button
                onClick={() => scrollToSection("projects")}
                className="border border-white text-white hover:bg-white hover:text-[#0B0F14] px-8 py-4 rounded-md font-medium text-lg"
              >
                View Projects
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-16 bg-[#12161C]/50">
        <div className="container mx-auto px-4">
          <motion.div
            {...fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <div>
              <div className="text-3xl font-bold text-[#F5C242] mb-2">250+</div>
              <div className="text-gray-400">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#F5C242] mb-2">15+</div>
              <div className="text-gray-400">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#F5C242] mb-2">ISO</div>
              <div className="text-gray-400">Certified Quality</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#F5C242] mb-2">24/7</div>
              <div className="text-gray-400">Support Available</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our Services
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From concept to completion, we deliver comprehensive construction
              solutions that exceed expectations.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Building2,
                title: "Commercial Construction",
                description:
                  "Modern office buildings, retail spaces, and industrial facilities built to the highest standards.",
              },
              {
                icon: Home,
                title: "Residential Construction",
                description:
                  "Custom homes and residential developments designed for comfort and lasting value.",
              },
              {
                icon: Wrench,
                title: "Renovations & Remodeling",
                description:
                  "Transform existing spaces with expert renovation and remodeling services.",
              },
              {
                icon: Building2,
                title: "Steel Fabrication",
                description:
                  "Precision steel fabrication and structural engineering for complex projects.",
              },
              {
                icon: CheckCircle,
                title: "Project Management",
                description:
                  "End-to-end project management ensuring on-time, on-budget delivery.",
              },
              {
                icon: Shield,
                title: "Safety Compliance",
                description:
                  "Industry-leading safety protocols and compliance with all regulations.",
              },
            ].map((service, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="bg-[#12161C] border border-white/10 hover:border-[#F5C242]/50 transition-all duration-300 rounded-lg p-6 h-full">
                  <div className="flex flex-col">
                    <service.icon className="w-12 h-12 text-[#F5C242] mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-400 mb-4">{service.description}</p>
                    <button className="text-[#F5C242] text-left hover:underline">
                      Learn more →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-20 bg-[#12161C]/30">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explore some of our most successful projects that showcase our
              commitment to excellence.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                image:
                  "https://images.unsplash.com/photo-1644411813513-ad77c1b77581?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtb2Rlcm4lMjBjb21tZXJjaWFsJTIwYnVpbGRpbmclMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzU4NzEyMDg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                title: "Downtown Corporate Tower",
                result: "Delivered 3 weeks early",
                tags: ["Commercial", "High-rise", "LEED Certified"],
              },
              {
                image:
                  "https://images.unsplash.com/photo-1667893185343-9e869ae6e1bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyZXNpZGVudGlhbCUyMGhvdXNlJTIwY29uc3RydWN0aW9uJTIwZnJhbWluZ3xlbnwxfHx8fDE3NTg3NzI2NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                title: "Luxury Residential Complex",
                result: "15% under budget",
                tags: ["Residential", "Luxury", "Smart Home"],
              },
              {
                image:
                  "https://images.unsplash.com/photo-1623489254637-a2dd8375243d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjB3b3JrZXJzJTIwc3RlZWwlMjBidWlsZGluZyUyMHNpdGV8ZW58MXx8fHwxNzU4NzcyNjXxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                title: "Industrial Manufacturing Plant",
                result: "Zero safety incidents",
                tags: ["Industrial", "Steel Frame", "Safety Excellence"],
              },
            ].map((project, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="bg-[#12161C] border border-white/10 hover:border-[#F5C242]/50 transition-all duration-300 rounded-lg overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/60 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {project.title}
                    </h3>
                    <div className="text-[#F5C242] font-semibold mb-4">
                      {project.result}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="bg-[#F5C242]/20 text-[#F5C242] px-2 py-1 rounded-md text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button className="text-[#F5C242] hover:underline">
                      View case study →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose SteelPeak Builders
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Three core pillars that drive our commitment to excellence in
              every project.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {[
              {
                icon: Shield,
                title: "Safety First",
                description:
                  "Zero-compromise approach to safety with industry-leading protocols and continuous training for all team members.",
              },
              {
                icon: Clock,
                title: "On-Time Delivery",
                description:
                  "Proven track record of delivering projects on schedule through meticulous planning and efficient project management.",
              },
              {
                icon: DollarSign,
                title: "Transparent Pricing",
                description:
                  "No hidden costs or surprise charges. Clear, detailed quotes and regular project updates keep you informed.",
              },
            ].map((pillar, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-20 h-20 bg-[#F5C242] rounded-full flex items-center justify-center mx-auto mb-6">
                  <pillar.icon className="w-10 h-10 text-[#0B0F14]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{pillar.title}</h3>
                <p className="text-gray-400 text-lg">{pillar.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-[#12161C]/30">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Process</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A streamlined approach that ensures quality results from initial
              consultation to project handover.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {[
              {
                step: "01",
                title: "Consult",
                description:
                  "Initial consultation to understand your vision and requirements",
              },
              {
                step: "02",
                title: "Plan",
                description:
                  "Detailed planning, design, and engineering with transparent timelines",
              },
              {
                step: "03",
                title: "Build",
                description:
                  "Expert construction with regular updates and quality checkpoints",
              },
              {
                step: "04",
                title: "Handover",
                description: "Final inspection, handover, and ongoing support",
              },
            ].map((process, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center relative"
              >
                <div className="w-16 h-16 bg-[#F5C242] text-[#0B0F14] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {process.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{process.title}</h3>
                <p className="text-gray-400">{process.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-[#F5C242]/30 transform -translate-y-1/2"></div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Our Clients Say
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                quote:
                  "SteelPeak Builders exceeded our expectations in every way. Their attention to detail and commitment to quality is unmatched.",
                name: "Sarah Johnson",
                role: "CEO, Tech Innovations",
              },
              {
                quote:
                  "Professional, reliable, and delivered exactly what they promised. Our new facility is perfect for our growing business.",
                name: "Michael Chen",
                role: "Operations Director, Global Manufacturing",
              },
              {
                quote:
                  "The team's expertise and dedication made our dream home a reality. We couldn't be happier with the results.",
                name: "Emily Rodriguez",
                role: "Homeowner",
              },
            ].map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="bg-[#12161C] border border-white/10 rounded-lg p-8 h-full">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-[#F5C242] text-[#F5C242]"
                      />
                    ))}
                  </div>
                  <blockquote className="text-lg mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-16 bg-[#F5C242]">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B0F14] mb-6">
              Ready to Start Your Project?
            </h2>
            <button
              onClick={() => scrollToSection("contact")}
              className="bg-[#0B0F14] text-white hover:bg-[#12161C] px-8 py-4 rounded-md font-medium text-lg flex items-center justify-center mx-auto"
            >
              Get a Quote Today
              <ArrowRight className="ml-2" size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div {...fadeInUp} className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {[
                {
                  question: "What are typical project timelines?",
                  answer:
                    "Project timelines vary based on scope and complexity. Residential projects typically take 3-8 months, while commercial projects can range from 6-18 months. We provide detailed timelines during the planning phase.",
                },
                {
                  question: "How do you handle pricing and budgets?",
                  answer:
                    "We provide transparent, detailed quotes with no hidden fees. Our pricing includes all materials, labor, and project management. We work within your budget and provide regular updates to ensure no surprises.",
                },
                {
                  question: "Do you handle permits and regulatory compliance?",
                  answer:
                    "Yes, we handle all necessary permits and ensure full compliance with local building codes and regulations. Our team stays current with all requirements and manages the approval process.",
                },
                {
                  question: "What warranties do you provide?",
                  answer:
                    "We provide comprehensive warranties on all our work, including structural warranties up to 10 years and workmanship warranties for 2 years. Specific warranty terms vary by project type.",
                },
                {
                  question: "Which areas do you serve?",
                  answer:
                    "We serve the greater metropolitan area and surrounding regions within a 100-mile radius. Contact us to confirm service availability for your specific location.",
                },
              ].map((faq, index) => (
                <div key={index} className="border border-white/10 rounded-lg">
                  <button
                    className="w-full text-left text-white hover:text-[#F5C242] px-4 py-3 flex justify-between items-center"
                    onClick={(e) => {
                      const content = e.currentTarget.nextElementSibling;
                      content.style.display =
                        content.style.display === "none" ? "block" : "none";
                    }}
                  >
                    {faq.question}
                    <ChevronDown className="w-5 h-5" />
                  </button>
                  <div className="text-gray-400 px-4 py-3 hidden">
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-20 bg-[#12161C]/30">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Get Your Free Quote
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Ready to bring your construction vision to life? Fill out the form
              below and we'll get back to you within 24 hours.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} className="max-w-2xl mx-auto">
            <div className="bg-[#12161C] border border-white/10 rounded-lg p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="text-white block mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      placeholder="Enter your full name"
                      className="w-full bg-[#1A1F26] border border-white/10 text-white placeholder:text-gray-500 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-white block mb-2">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="w-full bg-[#1A1F26] border border-white/10 text-white placeholder:text-gray-500 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="text-white block mb-2">
                      Phone
                    </label>
                    <input
                      id="phone"
                      placeholder="Enter your phone number"
                      className="w-full bg-[#1A1F26] border border-white/10 text-white placeholder:text-gray-500 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="project-type"
                      className="text-white block mb-2"
                    >
                      Project Type *
                    </label>
                    <div className="relative">
                      <select
                        id="project-type"
                        className="w-full bg-[#1A1F26] border border-white/10 text-white rounded-md px-3 py-2 appearance-none"
                      >
                        <option value="" disabled selected>
                          Select project type
                        </option>
                        <option value="commercial">
                          Commercial Construction
                        </option>
                        <option value="residential">
                          Residential Construction
                        </option>
                        <option value="renovation">
                          Renovation/Remodeling
                        </option>
                        <option value="steel">Steel Fabrication</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="text-white block mb-2">
                    Project Details *
                  </label>
                  <textarea
                    id="message"
                    placeholder="Tell us about your project..."
                    rows={4}
                    className="w-full bg-[#1A1F26] border border-white/10 text-white placeholder:text-gray-500 rounded-md px-3 py-2"
                  />
                </div>

                <div className="text-sm text-gray-400">
                  * Required fields. Your information is secure and will not be
                  shared with third parties.
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F5C242] text-[#0B0F14] hover:bg-[#F5C242]/90 px-4 py-3 rounded-md font-medium"
                >
                  Send Quote Request
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B0F14] py-16 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-[#F5C242] mb-4">
                SteelPeak Builders
              </div>
              <p className="text-gray-400 mb-4">
                Building strong foundations for your vision with unmatched
                quality and precision.
              </p>
              <div className="flex space-x-4">
                <button className="text-gray-400 hover:text-[#F5C242] transition-colors">
                  LinkedIn
                </button>
                <button className="text-gray-400 hover:text-[#F5C242] transition-colors">
                  Facebook
                </button>
                <button className="text-gray-400 hover:text-[#F5C242] transition-colors">
                  Instagram
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button
                  onClick={() => scrollToSection("services")}
                  className="block text-gray-400 hover:text-[#F5C242] transition-colors"
                >
                  Services
                </button>
                <button
                  onClick={() => scrollToSection("projects")}
                  className="block text-gray-400 hover:text-[#F5C242] transition-colors"
                >
                  Projects
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="block text-gray-400 hover:text-[#F5C242] transition-colors"
                >
                  About Us
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="block text-gray-400 hover:text-[#F5C242] transition-colors"
                >
                  FAQ
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-[#F5C242]" />
                  <span className="text-gray-400">(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-[#F5C242]" />
                  <span className="text-gray-400">
                    info@steelpeakbuilders.com
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-[#F5C242]" />
                  <span className="text-gray-400">
                    123 Construction Ave, Builder City, BC 12345
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Business Hours</h4>
              <div className="space-y-2 text-gray-400">
                <div>Monday - Friday: 7:00 AM - 6:00 PM</div>
                <div>Saturday: 8:00 AM - 4:00 PM</div>
                <div>Sunday: Emergency Only</div>
                <div className="text-[#F5C242] mt-3">
                  24/7 Emergency Support
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SteelPeak Builders. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
