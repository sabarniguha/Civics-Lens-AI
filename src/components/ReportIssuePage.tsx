import React, { useState, useRef } from 'react';
import {
  Sparkles,
  MapPin,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  X,
  Navigation,
  ShieldAlert,
  Mic,
  MicOff,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { IssueCategory, ReportPriority, AIRecommendation, Report } from '../types';
import { CATEGORIES_CONFIG, PRIORITY_CONFIG } from '../utils/categories';
import { CategoryIcon } from './CategoryIcon';
import { saveReportToFirestore } from '../firebase/service';

interface Props {
  currentUser: User | null;
  onReportCreated: (report: Report) => void;
  onNavigateToHub: () => void;
}

const ALL_CATEGORIES: IssueCategory[] = [
  'Potholes & Road Damage',
  'Streetlights & Electrical',
  'Sanitation & Illegal Dumping',
  'Water, Sewer & Drainage',
  'Parks & Public Facilities',
  'Traffic & Pedestrian Safety',
  'Graffiti & Vandalism',
  'Other Community Issues',
];

const QUICK_LANDMARKS = [
  '450 North Lincoln Ave (School Zone)',
  'Corner of Maple St & Elmwood Blvd',
  'Riverside Community Park Playground',
  'Alleyway behind 1820 Harrison St',
  'Oak & 12th Avenue Crosswalk',
  'Downtown Metro Station Plaza',
];

export const ReportIssuePage: React.FC<Props> = ({
  currentUser,
  onReportCreated,
  onNavigateToHub,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Potholes & Road Damage');
  const [priority, setPriority] = useState<ReportPriority>('Medium');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageName, setImageName] = useState<string>('');

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [appliedAi, setAppliedAi] = useState(false);

  // Audio Dictation state (gemini-3.5-transcribe)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        setIsTranscribing(true);

        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Audio = reader.result as string;
            const res = await fetch('/api/transcribe-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' }),
            });
            const data = await res.json();
            if (data.text) {
              setDescription((prev) => (prev ? `${prev} ${data.text}` : data.text));
              if (formErrors.description) setFormErrors((errs) => ({ ...errs, description: '' }));
            }
          } catch (err) {
            console.error('Transcription failed:', err);
          } finally {
            setIsTranscribing(false);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone permission or support issue:', err);
      alert('Microphone access is needed for audio dictation.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Form Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Photo handler with client-side image compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WEBP).');
      return;
    }

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Basic image size clamp using canvas if very large
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setImageBase64(compressedBase64);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // HTML5 Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lng = parseFloat(pos.coords.longitude.toFixed(5));
        setLatitude(lat);
        setLongitude(lng);
        setLocation(`Near GPS Coordinates: ${lat}, ${lng} (Current Device Location)`);
        setFormErrors((prev) => ({ ...prev, location: '' }));
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        alert('Could not access current location. Please type the street or landmark name.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Server-side Gemini AI analysis trigger
  const handleTriggerAiAnalysis = async () => {
    if (!description.trim() || description.trim().length < 8) {
      setFormErrors((prev) => ({
        ...prev,
        description: 'Please enter a description (at least 8 characters) before running AI analysis.',
      }));
      return;
    }

    setFormErrors((prev) => ({ ...prev, description: '' }));
    setIsAnalyzing(true);
    setAiError(null);

    try {
      const response = await fetch('/api/analyze-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          location,
          category,
          imageBase64: imageBase64 || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      setAiRecommendation(data);
      setAppliedAi(false);
    } catch (err: any) {
      console.error('Error invoking Gemini analysis:', err);
      setAiError(err.message || 'Unable to connect to Gemini AI service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAiSuggestions = () => {
    if (!aiRecommendation) return;
    setCategory(aiRecommendation.suggestedCategory);
    setPriority(aiRecommendation.suggestedPriority);
    setAppliedAi(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters.';
    }
    if (!description.trim() || description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters.';
    }
    if (!location.trim() || location.trim().length < 3) {
      errors.location = 'Please provide a street address, intersection, or landmark.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit report to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const reportPayload = {
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        latitude,
        longitude,
        imageUrl: imageBase64 || undefined,
        priority,
        status: 'Submitted' as const,
        userId: currentUser?.uid || `guest-${Date.now()}`,
        userEmail: currentUser?.email || 'citizen.reporter@civiclens.local',
        userName: currentUser?.displayName || 'Resident Reporter',
        isPublic: true,
        aiRecommendation: aiRecommendation || undefined,
      };

      const newReport = await saveReportToFirestore(reportPayload);
      setSubmittedReport(newReport);
      onReportCreated(newReport);
    } catch (err) {
      console.error('Failed to submit report:', err);
      alert('Error submitting report. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Potholes & Road Damage');
    setPriority('Medium');
    setLocation('');
    setLatitude(undefined);
    setLongitude(undefined);
    setImageBase64('');
    setImageName('');
    setAiRecommendation(null);
    setSubmittedReport(null);
    setAppliedAi(false);
  };

  // If report just submitted, show success card
  if (submittedReport) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Issue Submitted Successfully!
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto mb-6">
            Your report has been entered into the municipal dispatch registry with tracking ID{' '}
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {submittedReport.id}
            </span>
            . You can monitor the inspection and repair progress live on the Resident Hub.
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 max-w-xl mx-auto text-left mb-8 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Category:</span>
              <span className="font-semibold text-slate-900">{submittedReport.category}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Priority:</span>
              <span className="font-semibold text-amber-700">{submittedReport.priority}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Location:</span>
              <span className="font-semibold text-slate-900 truncate max-w-[320px]">{submittedReport.location}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                Submitted (Pending Dispatch Review)
              </span>
            </div>
            {submittedReport.aiRecommendation && (
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini AI Advisory Note:
                </div>
                <p className="text-[11px] text-slate-600 italic">
                  "{submittedReport.aiRecommendation.explanation}"
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onNavigateToHub}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              View in Resident Hub
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl transition-all"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          AI-Assisted Municipal Triage
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Report a Community Issue
        </h1>
        <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
          Help city dispatchers resolve neighborhood hazards faster. Describe the issue, attach an optional photo, and let our Gemini-powered AI verify priority and suggest the municipal department for official review.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="issue-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Issue Summary / Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="issue-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formErrors.title) setFormErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="e.g. Deep pothole damaging tires near school crosswalk"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                  formErrors.title
                    ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/20'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              {formErrors.title && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <label htmlFor="issue-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Detailed Description <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isTranscribing}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                      isRecording
                        ? 'bg-rose-500 text-white animate-pulse'
                        : isTranscribing
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <Mic className={`w-3 h-3 ${isRecording ? 'animate-bounce' : ''}`} />
                    {isRecording ? 'Stop Recording' : isTranscribing ? 'Transcribing...' : 'Voice Dictate'}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">
                  {description.length} characters
                </span>
              </div>
              <textarea
                id="issue-desc"
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: '' }));
                }}
                placeholder="Describe what you observed: severity of damage, exact spot, any immediate danger to pedestrians, vehicles, or pets..."
                className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                  formErrors.description
                    ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/20'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              {formErrors.description && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.description}
                </p>
              )}

              {/* Gemini AI Trigger Button */}
              <div className="mt-2.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTriggerAiAnalysis}
                  disabled={isAnalyzing || description.length < 5}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    description.length >= 5
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white cursor-pointer hover:shadow-md'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  {isAnalyzing ? 'Gemini 3.8 Flash Analyzing...' : 'Analyze with CivicLens AI'}
                </button>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Auto-evaluates category & severity
                </span>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Optional Photo Evidence
              </label>

              {imageBase64 ? (
                <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900/5 p-2">
                  <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={imageBase64}
                      alt="Uploaded preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageBase64('');
                        setImageName('');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-lg transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 px-2 flex justify-between items-center text-xs text-slate-600">
                    <span className="truncate max-w-[240px] font-medium">{imageName}</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready for Gemini Vision
                    </span>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/30">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-2">
                    <Camera className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Click to browse or drag and drop a photo
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PNG, JPG, or WEBP (Images analyzed directly by Gemini Vision)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Location */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="issue-loc" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Location / Address <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  {isLocating ? 'Locating...' : 'Use My GPS'}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="issue-loc"
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (formErrors.location) setFormErrors((prev) => ({ ...prev, location: '' }));
                  }}
                  placeholder="Street address, nearest intersection, or civic park name"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                    formErrors.location
                      ? 'border-rose-300 focus:ring-rose-500/20 bg-rose-50/20'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {formErrors.location && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.location}
                </p>
              )}

              {/* Quick Landmark Chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] text-slate-400 self-center mr-1">Quick Picks:</span>
                {QUICK_LANDMARKS.map((landmark) => (
                  <button
                    key={landmark}
                    type="button"
                    onClick={() => {
                      setLocation(landmark);
                      setFormErrors((prev) => ({ ...prev, location: '' }));
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {landmark}
                  </button>
                ))}
              </div>
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              {/* Category selector */}
              <div>
                <label htmlFor="issue-cat" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="issue-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IssueCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">
                  {CATEGORIES_CONFIG[category].department}
                </p>
              </div>

              {/* Priority selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Priority Urgency
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Low', 'Medium', 'High', 'Critical'] as ReportPriority[]).map((p) => {
                    const isSelected = priority === p;
                    const config = PRIORITY_CONFIG[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? `${config.badge} ring-2 ring-emerald-500/30 font-extrabold shadow-xs`
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {PRIORITY_CONFIG[priority].text}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    Recording to Municipal Registry...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Submit Official Community Report
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Logged under your authenticated account or guest session. Visible on the public community resolution board.
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Real-time Gemini AI Advisory Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200/80 shadow-md relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    Gemini AI Triage Assessment
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Powered by Google Gemini 3.8 Flash
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Advisory
              </span>
            </div>

            {/* Mandatory Clear Advisory Label per Prompt Instructions */}
            <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-blue-900 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong className="font-bold">Human Review Required:</strong> These suggestions are algorithmic recommendations generated by Gemini AI. City dispatchers verify all priorities before field team deployment.
              </p>
            </div>

            {isAnalyzing && (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Gemini AI is Analyzing Report...
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Cross-referencing municipal hazards, public safety risk levels, and operational department routing.
                </p>
              </div>
            )}

            {!isAnalyzing && aiError && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  AI Analysis Notice
                </div>
                <p className="text-[11px] leading-relaxed text-rose-700">
                  {aiError}
                </p>
                <button
                  type="button"
                  onClick={handleTriggerAiAnalysis}
                  className="text-xs text-rose-800 font-bold underline"
                >
                  Retry Analysis
                </button>
              </div>
            )}

            {!isAnalyzing && !aiRecommendation && !aiError && (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Awaiting Issue Details
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Type an issue description or upload a photo, then click <strong className="text-slate-700">"Analyze with CivicLens AI"</strong> to receive real-time triage advice.
                </p>
              </div>
            )}

            {!isAnalyzing && aiRecommendation && (
              <div className="mt-5 space-y-4">
                {/* Confidence & Live Indicator */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Model Confidence:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${aiRecommendation.confidence}%` }}
                      />
                    </div>
                    <span className="font-extrabold text-slate-900 text-xs">
                      {aiRecommendation.confidence}%
                    </span>
                  </div>
                </div>

                {/* Suggested Category & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Suggested Category
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <CategoryIcon category={aiRecommendation.suggestedCategory} className="w-4 h-4 text-emerald-600" />
                      <span className="truncate">{aiRecommendation.suggestedCategory}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Suggested Priority
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <span className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[aiRecommendation.suggestedPriority].dot}`} />
                      <span>{aiRecommendation.suggestedPriority}</span>
                    </div>
                  </div>
                </div>

                {/* Urgency Flags */}
                {aiRecommendation.detectedUrgencyFlags && aiRecommendation.detectedUrgencyFlags.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                      Identified Hazard Flags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiRecommendation.detectedUrgencyFlags.map((flag) => (
                        <span
                          key={flag}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                        >
                          ⚠️ {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Municipal Explanation */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    AI Municipal Triage Justification
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {aiRecommendation.explanation}
                  </p>
                </div>

                {/* Recommended Operational Action */}
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block mb-1">
                    Recommended Dispatch Action
                  </span>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                    {aiRecommendation.recommendedAction}
                  </p>
                </div>

                {/* Apply Suggestions Button */}
                <button
                  type="button"
                  onClick={handleApplyAiSuggestions}
                  disabled={appliedAi}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    appliedAi
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  }`}
                >
                  {appliedAi ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Applied to Form
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Apply AI Category & Priority to Form
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Civic Community Guidelines */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              Reporting Guidelines
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed text-slate-500">
              <li>For immediate life-threatening emergencies, always dial 911 directly.</li>
              <li>Provide clear street intersections or landmarks to accelerate field team arrival.</li>
              <li>Take photos from a safe distance without stepping into active vehicular traffic lanes.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
