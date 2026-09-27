import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Navigation,
  Sparkles,
  Zap,
  MapPin,
  Clock,
  Compass,
  Volume2,
  VolumeX,
  CheckCircle2,
  Truck
} from 'lucide-react';
import { playScaleBeep } from '../../utils/audio';

export const RouteMapSimulator: React.FC = () => {
  const { routeStops, optimizeRouteTsp, showToast } = useApp();
  const [voiceNavEnabled, setVoiceNavEnabled] = useState<boolean>(true);

  const toggleVoiceNav = () => {
    setVoiceNavEnabled(!voiceNavEnabled);
    playScaleBeep();
    showToast(
      !voiceNavEnabled ? 'Audio voice navigation enabled' : 'Voice navigation muted',
      'info'
    );
  };

  const nextStop = routeStops.find(s => s.status !== 'completed') || routeStops[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold shadow-inner">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <span>Smart GPS Dispatch &amp; Route Optimizer</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                TSP AI Engine
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Koramangala Ward 4B &bull; EV Loader #KA-01-EA-4910
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleVoiceNav}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1 ${
              voiceNavEnabled
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-400'
            }`}
            title="Toggle Voice Directions"
          >
            {voiceNavEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{voiceNavEnabled ? 'Voice ON' : 'Muted'}</span>
          </button>

          <button
            onClick={optimizeRouteTsp}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Optimize Stops (TSP)</span>
          </button>
        </div>
      </div>

      {/* Visual Stylized Map Canvas */}
      <div className="relative h-64 sm:h-72 w-full rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-inner">
        {/* Subtle Map Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 pointer-events-none" />

        {/* Road Polylines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Connected route paths */}
          {routeStops.map((stop, idx) => {
            if (idx === routeStops.length - 1) return null;
            const next = routeStops[idx + 1];
            return (
              <line
                key={`line-${idx}`}
                x1={`${stop.coordinates.x}%`}
                y1={`${stop.coordinates.y}%`}
                x2={`${next.coordinates.x}%`}
                y2={`${next.coordinates.y}%`}
                stroke="url(#routeGrad)"
                strokeWidth="3"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            );
          })}
        </svg>

        {/* Moving Kabadiwala Loader Marker */}
        <div
          className="absolute z-20 transition-all duration-1000 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${nextStop?.coordinates.x || 35}%`,
            top: `${nextStop?.coordinates.y || 42}%`
          }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-emerald-500 border-2 border-white text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounce">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-950/90 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/40">
              Loader Moving
            </span>
          </div>
        </div>

        {/* Route Stops Plotted */}
        {routeStops.map(stop => (
          <div
            key={stop.id}
            className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: `${stop.coordinates.x}%`, top: `${stop.coordinates.y}%` }}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-md border-2 border-white transition group-hover:scale-125 ${
                stop.status === 'completed'
                  ? 'bg-slate-700 text-slate-300'
                  : stop.status === 'en_route'
                  ? 'bg-amber-500 text-white ring-4 ring-amber-500/30'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {stop.status === 'completed' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                stop.sequence
              )}
            </div>

            <div className="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] p-2 rounded-xl shadow-xl border border-slate-700 pointer-events-none z-30">
              <span className="font-bold block">{stop.name}</span>
              <span className="text-slate-400">{stop.address}</span>
              <span className="text-emerald-400 block font-mono">~{stop.weight} kg scrap</span>
            </div>
          </div>
        ))}

        {/* Map Legend Overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Stops: 4 Scheduled</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Optimal Range: 4.8 km</span>
          </div>
        </div>
      </div>

      {/* Turn-by-Turn Instruction Banner */}
      {nextStop && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800">
                Next Waypoint: Stop #{nextStop.sequence}
              </span>
              <div className="font-extrabold text-slate-900">
                {nextStop.name} &bull; {nextStop.address}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="font-black text-emerald-700 text-sm">{nextStop.distanceKm} km</span>
            <span className="text-[10px] text-slate-500 block font-medium">ETA ~4 mins</span>
          </div>
        </div>
      )}
    </div>
  );
};
