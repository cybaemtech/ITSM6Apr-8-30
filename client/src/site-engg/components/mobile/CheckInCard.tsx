import { useState } from 'react';
import { MapPin, CheckCircle, Loader2, AlertTriangle, ExternalLink, LogOut, Navigation } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkInService } from '../../services/checkInService';
import type { CheckIn } from '../../types';

interface CheckInCardProps {
  checkIn: CheckIn | null;
  onCheckInComplete: (checkIn: CheckIn) => void;
  onCheckOutComplete?: () => void;
}

export default function CheckInCard({ checkIn, onCheckInComplete, onCheckOutComplete }: CheckInCardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckIn() {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let latitude = 0;
      let longitude = 0;
      let locationName = 'Location unavailable';
      let gotLocation = false;

      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true, timeout: 10000, maximumAge: 120000
            });
          }).catch(async (err) => {
            if (err.code === 3 || err.code === 2) {
              return new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: false, timeout: 8000, maximumAge: 300000
                });
              });
            }
            throw err;
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          gotLocation = true;
        } catch (geoErr: any) {
          if (geoErr.code === 1) throw geoErr;
        }
      }

      if (!gotLocation) {
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            latitude = parseFloat(ipData.latitude) || 0;
            longitude = parseFloat(ipData.longitude) || 0;
            locationName = [ipData.city, ipData.region, ipData.country_name].filter(Boolean).join(', ');
            gotLocation = true;
          }
        } catch { /* skip */ }
      }

      if (!gotLocation) {
        try {
          const ipRes2 = await fetch('https://freeipapi.com/api/json');
          if (ipRes2.ok) {
            const ipData2 = await ipRes2.json();
            latitude = parseFloat(ipData2.latitude) || 0;
            longitude = parseFloat(ipData2.longitude) || 0;
            locationName = [ipData2.cityName, ipData2.regionName, ipData2.countryName].filter(Boolean).join(', ');
            gotLocation = true;
          }
        } catch { /* skip */ }
      }

      if (!gotLocation) throw new Error('Could not determine location.');

      if (locationName === 'Location unavailable') {
        locationName = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            locationName = geoData.display_name || locationName;
          }
        } catch { /* keep coords */ }
      }

      const result = await checkInService.createCheckIn(
        (user as any).engineerId || user.id, latitude, longitude, locationName
      );
      onCheckInComplete(result);
    } catch (err: any) {
      setError(err.code === 1 ? 'Location access denied. Enable location in settings.' : (err.message || 'Failed to check in'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut() {
    if (!checkIn) return;
    setCheckingOut(true);
    setError(null);
    try {
      await checkInService.checkOut(checkIn.id);
      onCheckOutComplete?.();
    } catch (err: any) {
      setError(err.message || 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  }

  if (checkIn) {
    const isComplete = !!checkIn.checkOutTime;
    return (
      <div className={`relative overflow-hidden rounded-3xl border shadow-2xl ${isComplete ? 'bg-[#1A1A1A] border-white/10' : 'bg-[#111827] border-blue-500/30'}`}>
        {!isComplete && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.15),transparent_70%)] pointer-events-none"></div>}
        <div className="relative p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-2xl shadow-xl ${isComplete ? 'bg-white/10 text-slate-400' : 'bg-blue-600 text-white'}`}>
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg tracking-tight ${isComplete ? 'text-white' : 'text-blue-400'}`}>
                {isComplete ? 'Session Complete' : 'On Duty'}
              </h3>
              <p className={`text-xs font-medium mt-1 ${isComplete ? 'text-slate-500' : 'text-blue-200/60'}`}>
                In: {new Date(checkIn.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                {checkIn.checkOutTime && ` — Out: ${new Date(checkIn.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
              </p>
            </div>
            {!isComplete && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Live</span>
              </div>
            )}
          </div>

          {checkIn.locationName && (
            <div className={`p-4 rounded-2xl mb-6 border ${isComplete ? 'bg-black/50 border-white/5' : 'bg-black/40 border-blue-500/10'}`}>
              <div className="flex items-start gap-3">
                <MapPin className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isComplete ? 'text-slate-500' : 'text-blue-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Location</p>
                  <p className="text-xs text-slate-300 leading-relaxed truncate">{checkIn.locationName}</p>
                  {checkIn.latitude && checkIn.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${checkIn.latitude},${checkIn.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-400 mt-3 hover:text-blue-300 transition-colors uppercase tracking-wider"
                    >
                      <ExternalLink className="w-3 h-3" /> View Maps
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isComplete && (
            <button
              onClick={handleCheckOut}
              disabled={checkingOut}
              className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 tracking-wide text-sm"
            >
              {checkingOut ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Closing Session...</>
              ) : (
                <><LogOut className="w-5 h-5" /> Check Out</>
              )}
            </button>
          )}
          {error && (
            <div className="flex items-start gap-2 mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-red-400/90">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-[#111111] rounded-3xl shadow-2xl border border-white/10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      <div className="relative p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <MapPin className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight">Attendance</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">GPS Authentication</p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 mb-6 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-400/90">{error}</p>
          </div>
        )}

        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group shadow-[0_0_40px_rgba(37,99,235,0.2)] text-sm tracking-wide"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Securing Location...</>
          ) : (
            <><Navigation className="w-5 h-5 group-hover:rotate-45 transition-transform" /> Check In Now</>
          )}
        </button>
      </div>
    </div>
  );
}
