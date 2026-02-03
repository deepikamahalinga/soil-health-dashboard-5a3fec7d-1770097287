import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const features = [
    {
      title: 'Soil Analysis',
      description: 'Get detailed insights about your soil composition and health',
      icon: '🌱',
    },
    {
      title: 'Recommendations',
      description: 'Receive personalized fertilizer and crop recommendations',
      icon: '📊',
    },
    {
      title: 'Regional Insights',
      description: 'Access region-specific soil health data and trends',
      icon: '🗺️',
    },
    {
      title: 'Visual Reports',
      description: 'View easy-to-understand visual representations of your data',
      icon: '📈',
    },
  ];

  const stats = [
    { label: 'Farmers Helped', value: '10,000+' },
    { label: 'Soil Reports Generated', value: '50,000+' },
    { label: 'Districts Covered', value: '100+' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 pt-20 pb-32 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Soil Health Dashboard
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Empowering Indian farmers with data-driven insights for better soil management
          and improved crop yields
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/reports"
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 
            transition-colors duration-300 text-lg font-semibold"
          >
            View Soil Reports
          </Link>
          <Link
            to="/about"
            className="bg-white text-green-600 px-8 py-3 rounded-lg border-2 border-green-600 
            hover:bg-green-50 transition-colors duration-300 text-lg font-semibold"
          >
            Learn More
          </Link>
        </div>
      </motion.section>

      {/* Features Grid */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow 
                duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="p-4"
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Ready to improve your soil health?
          </h2>
          <Link
            to="/signup"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg 
            hover:bg-green-700 transition-colors duration-300 text-lg font-semibold"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;