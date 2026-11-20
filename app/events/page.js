'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  User, 
  Users, 
  MessageSquare, 
  Send, 
  Loader2, 
  Home, 
  CalendarPlus, 
  MapPin, 
  Heart, 
  Sparkles, 
  Clock,
  ChevronRight,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 1. Google Form Submission Endpoint & Entry IDs
const FORM_ENDPOINT = 'https://docs.google.com/forms/d/e/1FAIpQLSeSVtc6uAxQaw2MOVCeOrZlA-IxqZWl-5dffp17LSw_AIs1YA/formResponse';
const ENTRY_NAME = 'entry.1405437147';
const ENTRY_STATUS = 'entry.837843677';
const ENTRY_GUESTS = 'entry.1282873364';
const ENTRY_CEREMONIES = 'entry.1233983433';
const ENTRY_MESSAGE = 'entry.1884014554';

// 2. Published Google Sheet CSV URL
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX28Ow8aEJNlcJT_0sHWqpkKVx3Hq1PJ9bV-foZTXolwmbLD0DH3HXTZ6G-2Or8c8afEvaXw209BgL/pub?gid=314884218&single=true&output=csv';

// 3. Wedding Events Array organized chronologically (Vratham before Reception)
const EVENTS_LIST = [
  {
    id: 'haldi',
    title: 'Haldi',
    date: 'Friday, 04th Sept 2026',
    time: '08:30 AM',
    locationName: '1 Questover Ct, St Peters, MO',
    mapsUrl: 'https://maps.app.goo.gl/qJE55nGfkNPKDkzj6?g_st=iw',
    theme: 'Yellow',
    ics: {
      title: "Vineela & Venkat's Haldi Ceremony",
      description: "Join us for the vibrant Haldi Ceremony of Vineela & Venkat at 08:30 AM.",
      startTime: "20260904T083000",
      endTime: "20260904T120000",
      filename: "haldi-ceremony.ics"
    }
  },
  {
    id: 'pelli-kuthuru',
    title: 'Peli Kuthuru and Peli Koduku',
    date: 'Friday, 04th Sept 2026',
    time: '10:00 AM',
    locationName: '1 Questover Ct, St Peters, MO',
    mapsUrl: 'https://maps.app.goo.gl/qJE55nGfkNPKDkzj6?g_st=iw',
    ics: {
      title: "Vineela & Venkat's Pelli Kuthuru and Peli Koduku",
      description: "Join us for Pelli Kuthuru and Peli Koduku ceremony at 11:02 AM.",
      startTime: "20260904T110200",
      endTime: "20260904T140000",
      filename: "pelli-kuthuru.ics"
    }
  },
  {
    id: 'mehandi',
    title: 'Mehandi',
    date: 'Friday, 04th Sept 2026',
    time: '05:00 PM',
    locationName: '1 Questover Ct, St Peters, MO',
    mapsUrl: 'https://maps.app.goo.gl/qJE55nGfkNPKDkzj6?g_st=iw',
    ics: {
      title: "Vineela & Venkat's Mehandi Night",
      description: "Join us for Mehandi celebration at 06:00 PM.",
      startTime: "20260904T180000",
      endTime: "20260904T220000",
      filename: "mehandi-night.ics"
    }
  },
  {
    id: 'wedding',
    title: 'Wedding Day',
    date: 'Saturday, 05th Sept 2026',
    time: '09:00 AM',
    locationName: 'The Hindu Temple of St Louis',
    mapsUrl: 'https://maps.app.goo.gl/QZRRP3PrJEx9x5J17?g_st=ipc',
    ics: {
      title: "Vineela & Venkat's Wedding Ceremony",
      description: "Join us for the auspicious Wedding Ceremony of Vineela & Venkat at 10:31 AM.",
      startTime: "20260905T103100",
      endTime: "20260905T143000",
      filename: "wedding-ceremony.ics"
    }
  },
  {
    id: 'vratham',
    title: 'Vratham',
    date: 'Sunday, 06th Sept 2026',
    time: '06:30 AM',
    locationName: '2500 Hawk Ridge Trail Ct, Lake St Louis, MO',
    mapsUrl: 'https://maps.app.goo.gl/CThQcnJ6YZhjMSad7',
    ics: {
      title: "Vineela & Venkat's Vratham",
      description: "Join us for the Vratham ceremony at 09:00 AM.",
      startTime: "20260906T090000",
      endTime: "20260906T120000",
      filename: "vratham.ics"
    }
  },
  {
    id: 'reception',
    title: 'Reception',
    date: 'Sunday, 06th Sept 2026',
    time: '12:00 PM',
    locationName: 'Persis Banquet Hall',
    mapsUrl: 'https://maps.app.goo.gl/RvZwvY2tDK6WD7Ad7?g_st=ic',
    ics: {
      title: "Vineela & Venkat's Reception",
      description: "Join us for the Reception celebration of Vineela & Venkat at 06:30 PM.",
      startTime: "20260906T183000",
      endTime: "20260906T223000",
      filename: "reception.ics"
    }
  }
];

export default function EventsInvite() {
  const [rsvpStatus, setRsvpStatus] = useState('With joy, I/We will be there');
  const [selectedCeremonies, setSelectedCeremonies] = useState([]); 
  const [ceremonyError, setCeremonyError] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const videoRef = useRef(null);

  const [counts, setCounts] = useState({ 
    going: 0, 
    notGoing: 0, 
    eventBreakdown: {}, 
    loading: true 
  });

  // iOS Safari Autoplay Configuration for background video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.log('Autoplay deferred:', err);
      });
    }
  }, []);

  const parseCsvRow = (text) => {
    const result = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cell.trim());
        cell = '';
      } else {
        cell += char;
      }
    }
    result.push(cell.trim());
    return result;
  };

  const parseGuestNumber = (val) => {
    if (!val) return 0;
    const cleanVal = val.replace(/"/g, '').trim();
    const match = cleanVal.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const fetchLiveCounts = async () => {
    try {
      const cacheBustingUrl = `${CSV_URL}&_t=${Date.now()}`;
      const res = await fetch(cacheBustingUrl, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const csvText = await res.text();
      
      const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        setCounts({ going: 0, notGoing: 0, eventBreakdown: {}, loading: false });
        return;
      }

      let goingTotal = 0;
      let notGoingTotal = 0;
      const breakdown = {};

      EVENTS_LIST.forEach(evt => {
        breakdown[evt.title] = 0;
      });

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvRow(lines[i]);
        
        const rawStatus = cols[2] ? cols[2].replace(/"/g, '').trim().toLowerCase() : '';
        const rawGuests = cols[3] ? cols[3] : '0';
        const guestCount = parseGuestNumber(rawGuests);
        const ceremoniesString = cols[4] ? cols[4].replace(/"/g, '') : '';

        if (rawStatus.includes('regret') || rawStatus.includes('not')) {
          notGoingTotal += 1;
        } else if (rawStatus.includes('will be there') || rawStatus.includes('going')) {
          goingTotal += guestCount;

          EVENTS_LIST.forEach(evt => {
            if (ceremoniesString.toLowerCase().includes(evt.title.toLowerCase())) {
              breakdown[evt.title] = (breakdown[evt.title] || 0) + guestCount;
            }
          });
        }
      }

      setCounts({
        going: goingTotal,
        notGoing: notGoingTotal,
        eventBreakdown: breakdown,
        loading: false
      });
    } catch (err) {
      console.error('Failed to fetch live guest counts:', err);
      setCounts((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchLiveCounts();
    const interval = setInterval(fetchLiveCounts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCeremonyToggle = (ceremonyTitle) => {
    const updated = selectedCeremonies.includes(ceremonyTitle)
      ? selectedCeremonies.filter(c => c !== ceremonyTitle)
      : [...selectedCeremonies, ceremonyTitle];
    
    setSelectedCeremonies(updated);
    if (updated.length > 0) {
      setCeremonyError(false);
    }
  };

  const handleAddToCalendar = (eventObj) => {
    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wedding Invitation//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:${eventObj.ics.title}`,
      `DESCRIPTION:${eventObj.ics.description}`,
      `LOCATION:${eventObj.locationName}`,
      `DTSTART:${eventObj.ics.startTime}`,
      `DTEND:${eventObj.ics.endTime}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", eventObj.ics.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rsvpStatus.includes('will be there') && selectedCeremonies.length === 0) {
      setCeremonyError(true);
      return;
    }

    setIsSubmitting(true);

    const formElement = e.target;
    const formData = new FormData(formElement);

    if (rsvpStatus.includes('regret') || rsvpStatus.includes('cannot')) {
      formData.set(ENTRY_GUESTS, '0');
      formData.delete(ENTRY_CEREMONIES);
    } else {
      formData.delete(ENTRY_CEREMONIES);
      selectedCeremonies.forEach(ceremony => {
        formData.append(ENTRY_CEREMONIES, ceremony);
      });
    }

    try {
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      });

      if (rsvpStatus.includes('will be there')) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF8C00', '#FF1493', '#32CD32']
        });
      }

      setSubmitted(true);
      setTimeout(() => {
        fetchLiveCounts();
      }, 800);
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="h-screen w-full relative flex flex-col justify-end font-sans overflow-hidden bg-[#0d131a]">
      
      {/* 1. Full-Bleed Video Background with iOS Autoplay and Native Controls Hidden */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-top pointer-events-none [&::-webkit-media-controls]:hidden [&::-webkit-media-controls-panel]:hidden [&::-webkit-media-controls-play-button]:hidden [&::-webkit-media-controls-start-playback-button]:hidden"
        >
          <source src="/events-bg.mp4" type="video/mp4" />
        </video>
        {/* Dark Gradient Overlay for Maximum Foreground Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* 2. Text & Controls */}
      <div 
        className="relative z-10 w-full max-w-md mx-auto px-5 flex flex-col items-center text-center space-y-4 bg-transparent"
        style={{ transform: 'translateY(-30px)' }}
      >
        
        {/* Event Details Frosted Glass Card */}
        <div className="w-full bg-black/45 backdrop-blur-md border border-white/15 rounded-3xl p-5 shadow-2xl space-y-2 text-white">
          <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-amber-300">
            Wedding Invitation
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white leading-tight drop-shadow-md">
            Vineela &amp; Venkat&apos;s
            <span className="block text-amber-200">Wedding Journey</span>
          </h1>
          <div className="pt-1 space-y-0.5">
            <p className="text-xs font-semibold text-slate-100">
              September 4 &ndash; 6, 2026
            </p>
            <p className="text-[11px] font-medium text-amber-100/90">
              Multiple Ceremonies &bull; St. Louis &amp; Plano
            </p>
          </div>
        </div>

        {/* Quick RSVP Trigger Bar */}
        <div className="w-full bg-[#252a30]/90 backdrop-blur-md rounded-full p-2 border border-white/20 flex items-center justify-between shadow-2xl">
          <button
            onClick={() => {
              setRsvpStatus('With joy, I/We will be there');
              setActiveModal('rsvp');
            }}
            className="flex-1 py-3 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-slate-100 hover:text-white transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>RSVP Now</span>
          </button>
        </div>

        {/* View Event Details Button */}
        <button
          onClick={() => setActiveModal('details')}
          className="w-full py-3.5 bg-[#3a414a]/90 hover:bg-[#48515c] text-white font-medium text-xs sm:text-sm rounded-2xl transition-all shadow-xl backdrop-blur-sm border border-white/10"
        >
          View Event Details
        </button>

      </div>

      {/* 3. Modals Container */}
      <AnimatePresence>
        {activeModal && (
          <>
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md z-30"
            />

            {/* MODAL 1: EVENT DETAILS */}
            {activeModal === 'details' && (
              <motion.div 
                key="modal-details"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className="fixed bottom-0 inset-x-0 bg-[#252223] text-white rounded-t-[36px] px-5 pt-5 pb-6 max-w-md mx-auto z-40 border-t border-white/10 shadow-2xl max-h-[85vh] flex flex-col"
              >
                {/* Top Actions Bar */}
                <div className="flex items-center justify-between pb-2 shrink-0">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                  >
                    <Home className="w-4 h-4" />
                  </button>
                  
                  <span className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold">
                    The Wedding Journey
                  </span>
                </div>

                {/* Scrollable List Container */}
                <div className="overflow-y-auto space-y-2.5 pr-1 my-2 flex-1 scrollbar-thin">
                  
                  {/* Clickable Guest List Summary Card */}
                  <div 
                    onClick={() => setActiveModal('guestBreakdown')}
                    className="bg-[#481c1d]/90 hover:bg-[#582224] border border-white/10 rounded-xl p-3 flex items-center justify-between shadow-inner cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1">
                          <span>Guest List</span>
                          <span className="text-[10px] text-amber-300 font-normal">(Tap for breakdown)</span>
                        </h3>
                        <p className="text-[11px] text-rose-100/80 font-medium">
                          {counts.loading ? (
                            'Updating guest counts...'
                          ) : (
                            `${counts.going} Attending \u2022 ${counts.notGoing} Cannot Attend`
                          )}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-300 shrink-0" />
                  </div>

                  {/* Couple Names Intro */}
                  <div className="text-center py-0.5">
                    <h4 className="text-sm font-bold text-white tracking-wide">
                      Vineela <span className="text-amber-300 font-serif font-normal">&amp;</span> Venkat
                    </h4>
                    <p className="text-[10px] text-amber-200/80">September 4 &ndash; 6, 2026</p>
                  </div>

                  {/* DYNAMIC EVENTS LIST */}
                  <div className="space-y-2">
                    {EVENTS_LIST.map((evt) => (
                      <div 
                        key={evt.id} 
                        className="bg-[#353032] border border-amber-500/25 rounded-xl p-3 text-left shadow-md space-y-1 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0 pr-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider truncate">
                              {evt.title}
                            </h5>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {evt.theme && (
                              <span className="text-[9px] text-amber-900 bg-amber-200/90 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                                {evt.theme}
                              </span>
                            )}
                            <button
                              onClick={() => handleAddToCalendar(evt)}
                              className="p-1 bg-white/10 hover:bg-white/20 rounded-md text-white text-[10px] flex items-center gap-1 transition-colors"
                              title={`Add ${evt.title} to Calendar`}
                            >
                              <CalendarPlus className="w-3 h-3 text-amber-400" />
                              <span>Cal</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
                          <span className="font-semibold text-amber-100/90 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400 shrink-0" /> {evt.date} &bull; {evt.time}
                          </span>
                        </div>

                        <div>
                          <a
                            href={evt.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 underline transition-colors leading-tight truncate max-w-full"
                          >
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">{evt.locationName}</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Sticky Bottom RSVP CTA */}
                <div className="pt-2 shrink-0 border-t border-white/10">
                  <button
                    onClick={() => setActiveModal('rsvp')}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Respond to RSVP</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>
            )}

            {/* MODAL 1B: PER-EVENT GUEST BREAKDOWN MODAL */}
            {activeModal === 'guestBreakdown' && (
              <motion.div 
                key="modal-breakdown"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className="fixed bottom-0 inset-x-0 bg-[#252223] text-white rounded-t-[36px] px-5 pt-5 pb-6 max-w-md mx-auto z-40 border-t border-white/10 shadow-2xl max-h-[85vh] flex flex-col"
              >
                {/* Top Actions Bar */}
                <div className="flex items-center justify-between pb-3 shrink-0">
                  <button 
                    onClick={() => setActiveModal('details')}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors flex items-center gap-1 text-xs"
                  >
                    <Home className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <span className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold">
                    Guest Count by Event
                  </span>
                </div>

                {/* Content Container */}
                <div className="overflow-y-auto space-y-3 pr-1 my-2 flex-1 scrollbar-thin">
                  
                  {/* Overall Summary Box */}
                  <div className="bg-[#481c1d]/90 border border-white/10 rounded-2xl p-4 text-center space-y-1 shadow-inner">
                    <h3 className="text-xs uppercase tracking-wider text-rose-200/80 font-semibold">Total RSVPs</h3>
                    <p className="text-xl font-bold text-white">
                      {counts.going} Attending <span className="text-xs font-normal text-slate-300">({counts.notGoing} declined)</span>
                    </p>
                  </div>

                  {/* List of Events with Breakdown Counts */}
                  <div className="space-y-2.5">
                    {EVENTS_LIST.map((evt) => {
                      const countForEvent = counts.eventBreakdown[evt.title] || 0;
                      return (
                        <div 
                          key={evt.id}
                          className="bg-[#353032] border border-amber-500/25 rounded-xl p-3.5 flex items-center justify-between shadow-md"
                        >
                          <div className="min-w-0 pr-2">
                            <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider truncate">
                              {evt.title}
                            </h5>
                            <p className="text-[11px] text-slate-300 pt-0.5">
                              {evt.date}
                            </p>
                          </div>
                          <div className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-lg shrink-0 text-center min-w-[70px]">
                            <span className="text-sm font-extrabold">{countForEvent}</span>
                            <span className="block text-[9px] uppercase tracking-wider text-amber-200/80 font-medium">Guests</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Close Breakdown Button */}
                <div className="pt-2 shrink-0 border-t border-white/10">
                  <button
                    onClick={() => setActiveModal('details')}
                    className="w-full py-3 bg-[#3a414a] hover:bg-[#48515c] text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    Close Breakdown
                  </button>
                </div>
              </motion.div>
            )}

            {/* MODAL 2: CONNECTED GOOGLE FORM RSVP */}
            {activeModal === 'rsvp' && (
              <motion.div 
                key="modal-rsvp"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className="fixed bottom-0 inset-x-0 bg-[#252223] text-white rounded-t-[36px] px-5 pt-5 pb-6 max-w-md mx-auto z-40 border-t border-white/10 shadow-2xl max-h-[90vh] flex flex-col"
              >
                {/* Top Actions Bar */}
                <div className="flex items-center justify-between pb-3 shrink-0">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                  >
                    <Home className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold">
                    Bless Us With Your Presence
                  </span>
                </div>

                <div className="overflow-y-auto pr-1 flex-1 scrollbar-thin">
                  {submitted ? (
                    <div className="py-10 text-center space-y-4">
                      <div className="w-16 h-16 bg-amber-400/20 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <Heart className="w-8 h-8 fill-amber-400" />
                      </div>
                      <h3 className="text-xl font-bold tracking-wide text-white leading-normal">
                        Response Recorded
                      </h3>
                      <p className="text-sm text-amber-200/90 max-w-xs mx-auto leading-relaxed font-serif italic">
                        &ldquo;We are eagerly awaiting for you to be here and share in our special moment!&rdquo;
                      </p>
                      <p className="text-xs text-slate-400 pt-2">
                        Vineela &amp; Venkat
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#353032] border border-white/10 rounded-2xl p-5 shadow-lg my-1">
                      <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        
                        {/* Name Input */}
                        <div>
                          <label className="block text-[0.68rem] tracking-[0.1em] uppercase text-amber-300 font-semibold mb-1">
                            Your Esteemed Name
                          </label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Enter your full name" 
                            className="w-full p-2.5 bg-white/10 rounded-lg border border-amber-300/40 text-sm focus:outline-none focus:border-amber-400 text-white placeholder:text-slate-400 shadow-inner" 
                            name={ENTRY_NAME}
                          />
                        </div>

                        {/* Presence Radio Selection */}
                        <div>
                          <label className="block text-[0.68rem] tracking-[0.1em] uppercase text-amber-300 font-semibold mb-1">
                            Will You Grace Us With Your Presence?
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <label className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                              rsvpStatus === 'With joy, I/We will be there' 
                                ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md' 
                                : 'bg-white/10 text-white border-amber-300/30'
                            }`}>
                              <input 
                                type="radio" 
                                required 
                                className="hidden" 
                                name={ENTRY_STATUS} 
                                value="With joy, I/We will be there"
                                checked={rsvpStatus === 'With joy, I/We will be there'}
                                onChange={() => {
                                  setRsvpStatus('With joy, I/We will be there');
                                  setCeremonyError(false);
                                }}
                              />
                              <span>Will be there</span>
                            </label>

                            <label className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                              rsvpStatus === 'With regret, I/We cannot' 
                                ? 'bg-rose-500 text-white font-bold border-rose-500 shadow-md' 
                                : 'bg-white/10 text-white border-amber-300/30'
                            }`}>
                              <input 
                                type="radio" 
                                required 
                                className="hidden" 
                                name={ENTRY_STATUS} 
                                value="With regret, I/We cannot"
                                checked={rsvpStatus === 'With regret, I/We cannot'}
                                onChange={() => {
                                  setRsvpStatus('With regret, I/We cannot');
                                  setCeremonyError(false);
                                }}
                              />
                              <span>Cannot attend</span>
                            </label>
                          </div>
                        </div>

                        {/* Conditional Fields (Hidden when "Cannot attend" is selected) */}
                        {rsvpStatus === 'With joy, I/We will be there' && (
                          <div className="space-y-3 pt-1 border-t border-amber-300/30 animate-fadeIn">
                            <div>
                              <label className="block text-[0.68rem] tracking-[0.1em] uppercase text-amber-300 font-semibold mb-1">
                                Total Guests Attending (Including You)
                              </label>
                              <input 
                                placeholder="e.g., 2" 
                                defaultValue="1" 
                                className="w-full p-2.5 bg-white/10 rounded-lg border border-amber-300/40 text-sm focus:outline-none focus:border-amber-400 text-white shadow-inner" 
                                type="text" 
                                name={ENTRY_GUESTS}
                              />
                            </div>

                            {/* Select Ceremonies Checkboxes (Mandatory Validation & Chronological Matching Order) */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[0.68rem] tracking-[0.1em] uppercase text-amber-300 font-semibold">
                                  Select Ceremonies You Will Honor Us Attending: *
                                </label>
                              </div>
                              <div className={`space-y-1.5 bg-black/30 p-2.5 rounded-lg border shadow-inner ${
                                ceremonyError ? 'border-rose-500' : 'border-amber-300/30'
                              }`}>
                                {[
                                  'Peli Kuthuru and Peli Koduku',
                                  'Haldi',
                                  'Mehandi',
                                  'Wedding Day',
                                  'Vratham',
                                  'Reception'
                                ].map((ceremony) => {
                                  const isChecked = selectedCeremonies.includes(ceremony);
                                  return (
                                    <label 
                                      key={ceremony} 
                                      onClick={() => handleCeremonyToggle(ceremony)}
                                      className="flex items-center gap-2.5 text-xs cursor-pointer text-slate-200 hover:text-white"
                                    >
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                        isChecked ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-white/30 bg-transparent'
                                      }`}>
                                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                      </div>
                                      <span>{ceremony}</span>
                                    </label>
                                  );
                                })}
                              </div>
                              {ceremonyError && (
                                <p className="text-[10px] text-rose-400 font-medium mt-1">
                                  Please select at least one ceremony to attend.
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Blessings & Wishes */}
                        <div>
                          <label className="block text-[0.68rem] tracking-[0.1em] uppercase text-amber-300 font-semibold mb-1">
                            Blessings &amp; Wishes for the Couple
                          </label>
                          <textarea 
                            name={ENTRY_MESSAGE} 
                            rows={2} 
                            placeholder="Leave a heartfelt note or message for the couple..." 
                            className="w-full p-2.5 bg-white/10 rounded-lg border border-amber-300/40 text-sm focus:outline-none focus:border-amber-400 text-white placeholder:text-slate-400 shadow-inner resize-none"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-[0.15em] rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" /> Send Your Blessings &amp; RSVP
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

    </main>
  );
}