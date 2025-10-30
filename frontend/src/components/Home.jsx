import { motion } from "framer-motion";
import React from "react";
import {
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { featureData, pricingData, testimonialData } from "./landing-page/landingPageComponent";

const FeatureCard = ({ icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="card group p-6"
  >
    <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-accent-primary group-hover:shadow-lg transition-all duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-light-text-primary dark:text-dark-text-primary group-hover:text-accent-primary transition-colors duration-300">
      {title}
    </h3>
    <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">{description}</p>
  </motion.div>
);

const StatCard = ({ number, label, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    className="text-center"
  >
    <div className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">{number}</div>
    <div className="text-light-text-secondary dark:text-dark-text-secondary">{label}</div>
  </motion.div>
);

const PricingCard = ({ name, price, period, features, highlighted = false }) => (
  <div className={`card ${highlighted ? "border-2 border-accent-primary shadow-lg" : ""}`}>
    <div className="p-6">
      <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">{name}</h3>
      <p className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
        {price}
        {period && <span className="text-lg text-light-text-secondary dark:text-dark-text-secondary ml-2">/{period}</span>}
      </p>
      <ul className="space-y-3 mt-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center">
            <FiCheckCircle className="w-5 h-5 text-accent-success mr-3" />
            <span className="text-light-text-secondary dark:text-dark-text-secondary">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-b-lg">
      <button
        type="button"
        className={`w-full ${highlighted ? "btn-primary" : "btn-secondary"}`}
      >
        Get Started
      </button>
    </div>
  </div>
);

const TestimonialCard = ({ name, role, company, avatar, content }) => (
  <div className="card">
    <div className="p-6">
      <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">"{content}"</p>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-accent-primary flex items-center justify-center font-bold text-white mr-4">
          {avatar}
        </div>
        <div>
          <p className="font-bold text-light-text-primary dark:text-dark-text-primary">{name}</p>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            {role}, {company}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const Home = () => {
  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary bg-[url('bg2.png')] bg-no-repeat bg-cover bg-center">
      {/* Navigation */}
      <nav className="bg-light-bg-primary/80 dark:bg-dark-bg-primary/80 backdrop-blur-md border-b border-light-border/50 dark:border-dark-border/50 fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary"
          >
            TaskFlow
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-light-text-primary dark:text-dark-text-primary">
              Manage Tasks with
              <span className="block">Stunning Simplicity</span>
            </h1>
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto leading-relaxed">
              Transform your productivity with our beautiful, intuitive task management platform.
              Collaborate seamlessly, track progress effortlessly, and achieve more together.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/register" className="btn-primary text-lg px-8 py-4 group">
              Start Free Today
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-4">
              Sign In
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <StatCard number="10K+" label="Active Users" delay={0.5} />
            <StatCard number="50K+" label="Tasks Completed" delay={0.6} />
            <StatCard number="99.9%" label="Uptime" delay={0.7} />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">
              Everything You Need
            </h2>
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
              Powerful features designed to streamline your workflow and boost team productivity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureData.map((feature, i) => (
              <FeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">
              Choose Your Plan
            </h2>
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
              Simple, transparent pricing for teams of all sizes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pricingData.map((plan, i) => (
              <PricingCard key={i} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
              See what our users are saying about TaskFlow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonialData.map((testimonial, i) => (
              <TestimonialCard key={i} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto card p-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary mb-8 leading-relaxed">
            Join thousands of teams who have already revolutionized their productivity with
            TaskFlow. Start your journey today, completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-4 group">
              Get Started Free
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No credit card required • Free forever</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">TaskFlow</div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            © {new Date().getFullYear()} TaskFlow. Crafted with ❤️ for productive teams.
          </p>
        </div>
      </footer>
    </div>
  );
};
