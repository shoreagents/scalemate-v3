'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Brain, Zap, Target, Sparkles, BarChart3, Users, TrendingUp, CheckCircle, Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {

  // Neural animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-neural-blue-50 via-white to-quantum-purple-50 relative overflow-hidden">
      {/* Hero Section */}
      <div className="mb-12 -mx-[50vw] ml-[calc(-50vw+50%)] mr-[calc(-50vw+50%)] px-[50vw] pl-[calc(50vw-50%+1.5rem)] pr-[calc(50vw-50%+1.5rem)] lg:pl-[calc(50vw-50%+2rem)] lg:pr-[calc(50vw-50%+2rem)] pt-8 pb-2 bg-neural-blue-50/30 border-y border-neural-blue-100/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-300/20 to-transparent animate-neural-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-400/10 via-quantum-purple-400/15 to-cyber-green-400/10 animate-neural-pulse" />
        <section className="relative z-10 px-6 pt-20 pb-16 mx-auto max-w-7xl lg:px-8">
          {/* Static background patterns */}
         
          
          <motion.div 
            className="relative z-10 text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* AI-Enhanced Logo */}
                     <motion.div 
             className="flex justify-center mb-8"
             variants={fadeInUp}
             transition={{ duration: 0.6, ease: "easeOut" }}
           >
            <Card 
             
            >
              <div className="h-12 w-48 bg-gradient-neural-primary rounded-xl flex items-center justify-center relative overflow-hidden">
                <span className="text-white font-display font-bold text-xl relative z-10">ScaleMate</span>
                <div className="absolute top-1 right-2">
                  
                </div>
              </div>
            </Card>
          </motion.div>

                    {/* Main Headline */}
          <motion.h1 
            className="text-display-2 gradient-text-neural mb-6 text-balance font-display"
            variants={fadeInUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Scale Your Business.
            <br />
            <span className="text-quantum-purple-600">Multiply Your Success.</span>
          </motion.h1>

          <motion.p 
            className="text-body-large text-neural-blue-700 mb-8 max-w-3xl mx-auto text-balance leading-relaxed"
            variants={fadeInUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            The intelligent offshore scaling calculator for property management companies. 
            Get precise cost savings projections and implementation strategies tailored to your business.
          </motion.p>

                    {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 w-full max-w-md sm:max-w-none mx-auto"
            variants={fadeInUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Link href="/quote-calculator" className="w-full sm:w-auto">
              <Button 
                variant="neural-primary"
                size="neural-lg"
            
                neuralGlow={true}
                rightIcon={<ArrowRight className="h-5 w-5" />}
                className="px-8 py-4 text-lg font-semibold w-full sm:w-auto"
              >
                Calculate Your Savings
              </Button>
            </Link>
            
            <Button 
              variant="quantum-secondary"
              size="neural-lg"
              leftIcon={<Play className="h-5 w-5" />}
              className="px-8 py-4 text-lg font-semibold w-full sm:w-auto"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-8 text-sm"
            variants={fadeInUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {[
              { icon: CheckCircle, text: "100% Transparent", color: "text-cyber-green-600" },
              { icon: Target, text: "Precise Results", color: "text-neural-blue-600" },
              { icon: Zap, text: "Instant Analysis", color: "text-quantum-purple-600" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-neural-blue-700 font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
          </motion.div>
        </section>
      </div>

      {/* AI Features Preview */}
      <section className="px-6 py-16 mx-auto max-w-7xl lg:px-8 relative">
        <motion.div 
          className="text-center mb-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
                     <motion.h2 
             className="text-headline-1 text-neural-blue-900 mb-4 font-display"
             variants={fadeInUp}
             transition={{ duration: 0.6, ease: "easeOut" }}
           >
            <span className="gradient-text-neural">Intelligent</span> Offshore Scaling
          </motion.h2>
                     <motion.p 
             className="text-body-large text-neural-blue-600 max-w-3xl mx-auto"
             variants={fadeInUp}
             transition={{ duration: 0.6, ease: "easeOut" }}
           >
            Our advanced calculator analyzes your portfolio size, team structure, and tasks to deliver 
            precise insights and intelligent optimization strategies for your property management business.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {/* AI Feature Card 1 */}
                     <motion.div variants={fadeInUp} transition={{ duration: 0.6, ease: "easeOut" }}>
            <Card 
              variant="ai-feature" 
              aiPowered={true}
              hoverLift={true}
              neuralGlow={true}
              className="h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neural-blue-500 to-neural-blue-600 flex items-center justify-center mb-4 shadow-neural-glow">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-headline-3 text-neural-blue-900 mb-2 font-display">Portfolio Analysis</h3>
              <p className="text-body text-neural-blue-600">
                Comprehensive portfolio assessment with precise calculations. Get tailored offshore team recommendations 
                based on your property count and management structure.
              </p>
              <div className="mt-4">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-neural-blue-100 text-neural-blue-700 text-xs font-medium rounded-full">
                  <BarChart3 className="h-3 w-3" />
                  <span>Data-Driven</span>
                </div>
              </div>
            </Card>
          </motion.div>

                     {/* AI Feature Card 2 */}
           <motion.div variants={fadeInUp} transition={{ duration: 0.6, ease: "easeOut" }}>
            <Card 
              variant="ai-feature" 
              aiPowered={true}
              hoverLift={true}
              neuralGlow={true}
              className="h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-quantum-purple-500 to-quantum-purple-600 flex items-center justify-center mb-4 shadow-quantum-glow">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-headline-3 text-neural-blue-900 mb-2 font-display">Role Optimization</h3>
              <p className="text-body text-neural-blue-600">
                Advanced role analysis with intelligent cost optimization. 
                See precise savings for each property management position with detailed breakdowns.
              </p>
              <div className="mt-4">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-quantum-purple-100 text-quantum-purple-700 text-xs font-medium rounded-full">
                  <Users className="h-3 w-3" />
                  <span>Optimized</span>
                </div>
              </div>
            </Card>
          </motion.div>

                     {/* AI Feature Card 3 */}
           <motion.div variants={fadeInUp} transition={{ duration: 0.6, ease: "easeOut" }}>
            <Card 
              variant="ai-feature" 
              aiPowered={true}
              hoverLift={true}
              neuralGlow={true}
              className="h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-green-500 to-cyber-green-600 flex items-center justify-center mb-4 shadow-cyber-glow">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-headline-3 text-neural-blue-900 mb-2 font-display">Instant Results</h3>
              <p className="text-body text-neural-blue-600">
                Lightning-fast processing delivers detailed savings breakdown, ROI projections, 
                and implementation timelines in real-time.
              </p>
              <div className="mt-4">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-cyber-green-100 text-cyber-green-700 text-xs font-medium rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  <span>Real-Time</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Neural Social Proof */}
      <div className="mb-12 -mx-[50vw] ml-[calc(-50vw+50%)] mr-[calc(-50vw+50%)] px-[50vw] pl-[calc(50vw-50%+1.5rem)] pr-[calc(50vw-50%+1.5rem)] lg:pl-[calc(50vw-50%+2rem)] lg:pr-[calc(50vw-50%+2rem)] pt-8 pb-2 bg-neural-blue-50/30 border-y border-neural-blue-100/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-300/20 to-transparent animate-neural-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-400/10 via-quantum-purple-400/15 to-cyber-green-400/10 animate-neural-pulse" />
        <section className="relative z-10 px-6 py-16 mx-auto max-w-7xl lg:px-8">
          
                   <motion.div 
             className="text-center relative z-10"
             initial="initial"
             whileInView="animate"
             viewport={{ once: true }}
             variants={fadeInUp}
             transition={{ duration: 0.6, ease: "easeOut" }}
           >
            <h2 className="text-headline-2 text-neural-blue-900 mb-8 font-display">
              Trusted by <span className="gradient-text-neural">Smart</span> Property Leaders
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
              {[1, 2, 3, 4].map((i) => (
                <motion.div 
                  key={i}
                  className="h-12 bg-white/80 backdrop-blur-lg border border-neural-blue-100 rounded-xl flex items-center justify-center shadow-sm hover:shadow-neural-glow transition-all duration-300"
                  whileHover={{ scale: 1.05, opacity: 1 }}
                >
                  <span className="text-neural-blue-600 font-medium">Company {i}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>

      {/* AI-Enhanced CTA Section */}
      <section className="px-6 py-20 mx-auto max-w-7xl lg:px-8">
        <Card 
          variant="neural-gradient" 
          className="text-center relative overflow-hidden"
          neuralGlow={true}
        >
          {/* Neural particle effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-neural-shimmer" />
          
          <div className="max-w-3xl mx-auto relative z-10 p-12">
            <motion.h2 
              className="text-headline-1 mb-4 font-display"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Ready to Scale Smarter?
            </motion.h2>
            <motion.p 
              className="text-body-large mb-8 opacity-90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Join thousands of property managers who've already unlocked their offshore scaling potential with ScaleMate.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/quote-calculator">
                <Button 
                  variant="quantum-secondary"
                  size="neural-xl"
                
              
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  className="bg-white text-neural-blue-600 hover:bg-neural-blue-50 px-8 py-4 text-lg font-semibold"
                >
                  Get Your Free Analysis
                </Button>
              </Link>
            </motion.div>
          </div>
        </Card>
      </section>
    </main>
  );
} 