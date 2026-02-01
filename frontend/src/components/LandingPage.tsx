import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Globe, Shield, ArrowRight, Wallet, ChevronRight } from 'lucide-react';


const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-12 relative z-10">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-accent-cyan mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
                        </span>
                        Live on Cronos Testnet
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                        The Future of <span className="gradient-text">Agentic Payments</span>
                    </h1>

                    <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        Tip-Pool bridges the gap between AI agents and on-chain settlement.
                        Automated micropayments, intelligent routing, and seamless team attribution.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <a href="https://tip-pool.vercel.app/" className="primary text-lg px-8 py-4 flex items-center gap-3 group">
                            Launch App <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a href="https://cronos.org" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-2xl border border-glass-border hover:bg-white/5 transition-colors font-semibold flex items-center gap-2">
                            Documentation <ExternalLinkIcon size={18} />
                        </a>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Zap size={32} className="text-accent-primary" />}
                        title="Instant Settlement"
                        description="Lightning fast transactions powered by Cronos EVM. Say goodbye to waiting periods."
                    />
                    <FeatureCard
                        icon={<Shield size={32} className="text-accent-cyan" />}
                        title="AI-Driven Security"
                        description="Intelligent agents monitor and validate every transaction before it hits the chain."
                    />
                    <FeatureCard
                        icon={<Globe size={32} className="text-accent-secondary" />}
                        title="Global Liquidity"
                        description="Access a unified liquidity pool for seamless cross-border team payments."
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-text-muted text-sm border-t border-glass-border">
                <p>© 2026 Tip Pool. Built for the Future.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-panel p-8 hover:bg-white/5 transition-colors"
    >
        <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit border border-white/10">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-text-secondary leading-relaxed">
            {description}
        </p>
    </motion.div>
);

const ExternalLinkIcon = ({ size }: { size: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

export default LandingPage;
