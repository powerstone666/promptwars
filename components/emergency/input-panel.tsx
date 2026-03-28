"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, ImagePlus, X, Globe, Mic, Square, Trash2 } from "lucide-react";
import { MAX_INPUT_CHARS, OUTPUT_LANGUAGES } from "@/lib/constants";
import { readBlobAsDataUrl } from "@/lib/assistant-audio";

const MAX_IMAGE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface InputPanelProps {
  onSubmit: (payload: {
    text: string;
    imageBase64?: string;
    outputLanguage?: string;
    audioBase64?: string;
  }) => void;
  isLoading: boolean;
  initialText?: string;
}

export function InputPanel({ onSubmit, isLoading, initialText = "" }: InputPanelProps) {
  const [text, setText] = useState(initialText);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [outputLanguage, setOutputLanguage] = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Sync when initialText changes (demo sample clicked)
  useEffect(() => {
    if (initialText) {
      setText(initialText);
      textareaRef.current?.focus();
    }
  }, [initialText]);

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_INPUT_CHARS;
  const hasText = text.trim().length >= 5;
  const hasAudio = !!audioBlob;
  const canSubmit = (hasText || hasAudio) && !isOverLimit && !isLoading && !isRecording;

  const selectedLang = OUTPUT_LANGUAGES.find((l) => l.code === outputLanguage) ?? OUTPUT_LANGUAGES[0];

  function handleSubmit() {
    if (!canSubmit) return;

    // Debounce rapid submits
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const audioBase64 = audioBlob ? await readBlobAsDataUrl(audioBlob) : undefined;
        onSubmit({
          text: text.trim(),
          imageBase64: imageBase64 ?? undefined,
          outputLanguage,
          audioBase64,
        });
      } catch (error) {
        setAudioError(error instanceof Error ? error.message : "Failed to process recorded audio.");
      }
    }, 100);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    // Validate type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }

    // Validate size
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError(`Image must be under ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    // Convert to base64 data URI
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.onerror = () => {
      setImageError("Failed to read image file.");
    };
    reader.readAsDataURL(file);

    // Reset file input so same file can be re-selected
    e.target.value = "";
  }, []);

  function removeImage() {
    setImageBase64(null);
    setImageError(null);
  }

  async function startRecording() {
    if (isLoading || isRecording) return;

    setAudioError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser does not support microphone recording.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        setAudioBlob(recordedBlob);
        setAudioUrl(URL.createObjectURL(recordedBlob));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      setAudioError(
        error instanceof Error
          ? error.message
          : "Microphone access is required to record voice input.",
      );
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || !isRecording) return;

    recorder.stop();
    recorder.stream.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  }

  function deleteRecording() {
    setAudioBlob(null);
    setAudioError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Drag & drop
  const [isDragging, setIsDragging] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    // Reuse the same validation logic via a synthetic event
    const dt = new DataTransfer();
    dt.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
      fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative ${isDragging ? "ring-2 ring-(--mr-gold) ring-offset-2 ring-offset-(--mr-base)" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the emergency situation... (e.g., &quot;my mother is sweating, chest pain, fainted, please help fast&quot;)"
          rows={4}
          maxLength={MAX_INPUT_CHARS + 100}
          disabled={isLoading}
          className={`w-full px-5 py-4 bg-(--mr-surface) border
                     text-(--mr-text) placeholder:text-(--mr-text-dim)
                     focus:outline-none focus:border-(--mr-gold) focus:shadow-[0_0_20px_rgba(255,215,0,0.1)]
                     resize-none transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed
                     ${isOverLimit ? "border-red-500" : "border-white/10"}`}
          aria-label="Emergency situation description"
          aria-describedby="input-help char-count"
        />

        {/* Character count */}
        <div
          id="char-count"
          className={`absolute bottom-3 right-3 text-xs
                     ${isOverLimit ? "text-red-400" : charCount > MAX_INPUT_CHARS * 0.9 ? "text-yellow-400" : "text-(--mr-text-dim)"}`}
          aria-live="polite"
        >
          {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()}
        </div>
      </div>

      {/* Image preview */}
      {imageBase64 && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageBase64}
            alt="Uploaded emergency image"
            className="max-h-37.5 w-auto object-cover border border-white/10"
          />
          <button
            onClick={removeImage}
            disabled={isLoading}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white
                       hover:bg-red-400 transition-colors disabled:opacity-50"
            aria-label="Remove uploaded image"
          >
            <X className="size-3" />
          </button>
          <span className="absolute bottom-1 left-1 text-[10px] text-white bg-black/60 px-2 py-0.5">
            📷 Image attached
          </span>
        </div>
      )}

      {/* Image error */}
      {imageError && (
        <p className="text-xs text-red-400">{imageError}</p>
      )}

      {audioUrl && (
        <div className="space-y-2">
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-(--mr-text-muted)">Voice note attached</span>
            <button
              onClick={deleteRecording}
              disabled={isLoading || isRecording}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
              aria-label="Delete recorded audio"
            >
              <Trash2 className="size-3" />
              Remove voice note
            </button>
          </div>
        </div>
      )}

      {audioError && (
        <p className="text-xs text-red-400">{audioError}</p>
      )}

      {/* Controls row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={handleImageSelect}
            className="hidden"
            aria-label="Upload emergency image"
          />

          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-(--mr-surface) hover:bg-(--mr-surface-high)
                       border border-white/10 hover:border-(--mr-gold)/30
                       text-xs font-bold text-(--mr-text-muted) hover:text-white transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed
                       focus:outline-none focus:border-(--mr-gold)"
            aria-label="Upload an image of the emergency"
          >
            <ImagePlus className="size-4" />
            {imageBase64 ? "Change Image" : "Add Image"}
          </button>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 border text-xs font-bold transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed
                       focus:outline-none focus:border-(--mr-gold)
                       ${
                         isRecording
                           ? "bg-red-500/10 border-red-500/40 text-red-300 hover:bg-red-500/15"
                           : "bg-(--mr-surface) hover:bg-(--mr-surface-high) border-white/10 hover:border-(--mr-gold)/30 text-(--mr-text-muted) hover:text-white"
                       }`}
            aria-label={isRecording ? "Stop voice recording" : "Record voice input"}
          >
            {isRecording ? <Square className="size-4" /> : <Mic className="size-4" />}
            {isRecording ? "Stop Recording" : audioBlob ? "Re-record Voice" : "Add Voice"}
          </button>

          {/* ── Language selector ── */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen((prev) => !prev)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-(--mr-surface) hover:bg-(--mr-surface-high)
                         border border-white/10 hover:border-(--mr-gold)/30
                         text-xs font-bold text-(--mr-text-muted) hover:text-white transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed
                         focus:outline-none focus:border-(--mr-gold)"
              aria-label="Select output language"
              aria-expanded={langOpen}
              aria-haspopup="listbox"
            >
              <Globe className="size-4" />
              <span>{selectedLang.native}</span>
              <svg
                className={`size-3 transition-transform ${langOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langOpen && (
              <div
                className="absolute bottom-full left-0 mb-2 w-56 max-h-60 overflow-y-auto
                           bg-(--mr-surface) border border-white/10 shadow-xl z-50"
                role="listbox"
                aria-label="Output language options"
              >
                {OUTPUT_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setOutputLanguage(lang.code);
                      setLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors
                               hover:bg-(--mr-surface-high)
                               ${lang.code === outputLanguage
                                 ? "text-(--mr-gold) bg-(--mr-gold)/5"
                                 : "text-(--mr-text-muted)"}`}
                    role="option"
                    aria-selected={lang.code === outputLanguage}
                  >
                    <span className="font-bold">{lang.native}</span>
                    <span className="text-(--mr-text-dim)">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p id="input-help" className="text-xs text-(--mr-text-dim) hidden sm:block">
            Drag & drop images • record voice •{" "}
            <kbd className="px-1.5 py-0.5 bg-(--mr-surface-high) text-(--mr-text-muted) text-[10px]">
              ⌘ Enter
            </kbd>
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-3 bg-(--mr-gold) text-(--mr-on-gold)
                     px-8 py-3 font-black italic text-base tracking-widest
                     active:scale-95 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                     hover:shadow-[0_0_30px_rgba(255,215,0,0.25)]
                     focus:outline-none focus:ring-2 focus:ring-(--mr-gold) focus:ring-offset-2 focus:ring-offset-(--mr-base)"
          style={{ fontFamily: "var(--font-headline)" }}
          aria-label={isLoading ? "Analyzing emergency..." : "Analyze emergency situation"}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ANALYZING...
            </>
          ) : (
            <>
              <Send className="size-5" aria-hidden="true" />
              {audioBlob && !hasText ? "ANALYZE VOICE" : "ANALYZE"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
