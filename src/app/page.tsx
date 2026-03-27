'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  CheckCircle2, 
  LayoutDashboard, 
  ShieldCheck, 
  Zap, 
  Globe, 
  BarChart3, 
  Database,
  Users,
  X,
  Activity
} from 'lucide-react'

export default function LandingPage() {
    const [isStatusOpen, setIsStatusOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Feature: Auto-login if session exists in demo_auth_user_role
        const savedRole = localStorage.getItem('demo_auth_user_role')
        if (savedRole && savedRole !== 'null') {
            router.push('/dashboard/pipeline')
        }
    }, [router])

    return (
        <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-white relative">
            
            {/* Left Side: Accurate Global Analytics Graph */}
            <div className="relative hidden md:flex md:w-1/2 h-full bg-slate-950 overflow-hidden">
                <img 
                    src="/landing-hero.png" 
                    alt="Analytics Graph" 
                    className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-[20s] hover:scale-110"
                />
                
                {/* Floating Glass Metric */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-sm px-6">
                     <div className="backdrop-blur-xl bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-700">
                         <div className="flex items-center justify-between mb-6">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-400/30">
                                <Activity className="text-blue-400" size={20} />
                            </div>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-1 rounded">Real-time</span>
                         </div>
                         <h3 className="text-2xl font-black text-white mb-2">Live Efficiency</h3>
                         <p className="text-blue-200/60 text-sm leading-relaxed mb-6 font-medium">
                             Monitoring manufacturing throughput and sales velocity across all departments.
                         </p>
                         <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full w-[85%] bg-gradient-to-r from-blue-500 to-teal-400 animate-pulse"></div>
                         </div>
                     </div>
                </div>

                <div className="absolute bottom-12 left-12">
                     <div className="flex items-center gap-4 text-white/40">
                         <Database size={16} />
                         <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scalable Infrastructure</span>
                     </div>
                </div>
            </div>

            {/* Right Side: Text & Description */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-24 bg-white relative">
                <div className="max-w-xl">
                    <div className="flex items-center gap-2 mb-8">
                        <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1.5 shadow-lg shadow-blue-200">
                            <Zap size={12} className="fill-white" /> Accelerated v2.0
                        </span>
                        <div className="h-4 w-[1px] bg-slate-200"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                           <ShieldCheck size={12} /> Enterprise Grade
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7.5xl font-black text-slate-900 mb-8 leading-[0.95] tracking-tighter">
                        Sales Cycle<br/><span className="text-blue-600">Perfected.</span>
                    </h1>
                    
                    <p className="text-xl text-slate-500 leading-relaxed mb-12 max-w-sm font-medium">
                        The definitive operating system for managing complex manufacturing pipelines—from initial lead to final dispatch.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <button 
                            onClick={() => router.push('/login')}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-6 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-2xl shadow-slate-200 group hover:scale-[1.02] active:scale-95"
                        >
                            <span>Enter Workspace</span>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <div className="flex -space-x-3">
                            {[1,2,3,4].map(i => (
                                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-slate-${i*100+100} flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm`}>
                                    U{i}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-20 grid grid-cols-2 gap-12 border-t border-slate-100 pt-10">
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-blue-600">
                                <BarChart3 size={18} />
                                <span className="text-xs font-black uppercase tracking-widest">Global Status</span>
                            </div>
                            <div className="text-slate-400 text-xs font-medium leading-relaxed">
                                End-to-end sales cycle tracking across all managed operational stages.
                            </div>
                        </div>
                        <div className="flex flex-col items-end justify-end">
                            <div className="text-right">
                                <div className="text-sm font-black text-slate-900 uppercase tracking-tighter">Proprietary</div>
                                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest font-mono">© 2026 Platform Inc.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Re-designed Functional "N" (Now "Platform Status") Button */}
            <div className="fixed bottom-8 left-8 z-[100]">
                <button 
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${isStatusOpen ? 'bg-red-500 rotate-90 scale-90' : 'bg-slate-900 hover:scale-110 hover:bg-blue-600'}`}
                >
                    {isStatusOpen ? <X className="text-white" size={24} /> : <div className="text-white font-black text-xl italic">S</div>}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                </button>

                {/* Status HUD (Heads-Up Display) */}
                {isStatusOpen && (
                    <div className="absolute bottom-20 left-0 w-80 bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-5 fade-in duration-300">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                             <Activity className="text-emerald-500" size={16} /> Platform Integrity
                        </h4>
                        <div className="space-y-4">
                             {[
                                 { label: 'Cloud Persistence', status: 'Online', color: 'text-emerald-400' },
                                 { label: 'Data Encryption', status: 'AES-256', color: 'text-blue-400' },
                                 { label: 'Active Sessions', status: '5 Roles', color: 'text-amber-400' },
                                 { label: 'Regional Servers', status: 'Global', color: 'text-purple-400' }
                             ].map((item, idx) => (
                                 <div key={idx} className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                                     <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                     <span className={`text-xs font-black ${item.color}`}>{item.status}</span>
                                 </div>
                             ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                 <Users className="text-slate-600" size={14} />
                                 <span className="text-[10px] font-bold text-slate-500">Live Traffic Early Access</span>
                             </div>
                             <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
