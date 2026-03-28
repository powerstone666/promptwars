"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, ImagePlus, X } from "lucide-react";
import { MAX_INPUT_CHARS } from "@/lib/constants";

const MAX_IMAGE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface InputPanelProps {
  onSubmit: (text: string, imageBase64?: string) => void;
  isLoading: boolean;
  initialText?: string;
}

export function InputPanel({ onSubmit, isLoading, initialText = "" }: InputPanelProps) {
  const [text, setText] = useState(initialText);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when initialText changes (demo sample clicked)
  useEffect(() => {
    if (initialText) {
      setText(initialText);
      textareaRef.current?.focus();
    }
  }, [initialText]);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_INPUT_CHARS;
  const canSubmit = text.trim().length >= 5 && !isOverLimit && !isLoading;

  function handleSubmit() {
    if (!canSubmit) return;

    // Debounce rapid submits
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSubmit(text.trim(), imageBase64 ?? undefined);
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
        className={`relative ${isDragging ? "ring-2 ring-[var(--mr-gold)] ring-offset-2 ring-offset-[var(--mr-base)]" : ""}`}
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
          className={`w-full px-5 py-4 bg-[var(--mr-surface)] border
                     text-[var(--mr-text)] placeholder:text-[var(--mr-text-dim)]
                     focus:outline-none focus:border-[var(--mr-gold)] focus:shadow-[0_0_20px_rgba(255,215,0,0.1)]
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
                     ${isOverLimit ? "text-red-400" : charCount > MAX_INPUT_CHARS * 0.9 ? "text-yellow-400" : "text-[var(--mr-text-dim)]"}`}
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
            className="max-h-[150px] w-auto object-cover border border-white/10"
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
            className="flex items-center gap-2 px-4 py-2 bg-[var(--mr-surface)] hover:bg-[var(--mr-surface-high)]
                       border border-white/10 hover:border-[var(--mr-gold)]/30
                       text-xs font-bold text-[var(--mr-text-muted)] hover:text-white transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed
                       focus:outline-none focus:border-[var(--mr-gold)]"
            aria-label="Upload an image of the emergency"
          >
            <ImagePlus className="size-4" />
            {imageBase64 ? "Change Image" : "Add Image"}
          </button>

          <p id="input-help" className="text-xs text-[var(--mr-text-dim)] hidden sm:block">
            Supports any language • Drag & drop images •{" "}
            <kbd className="px-1.5 py-0.5 bg-[var(--mr-surface-high)] text-[var(--mr-text-muted)] text-[10px]">
              ⌘ Enter
            </kbd>
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-3 bg-[var(--mr-gold)] text-[var(--mr-on-gold)]
                     px-8 py-3 font-black italic text-base tracking-widest
                     active:scale-95 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                     hover:shadow-[0_0_30px_rgba(255,215,0,0.25)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--mr-gold)] focus:ring-offset-2 focus:ring-offset-[var(--mr-base)]"
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
              ANALYZE
            </>
          )}
        </button>
      </div>
    </div>
  );
}
