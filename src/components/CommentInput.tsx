'use client';

import { useState, useEffect, useRef, KeyboardEvent, FormEvent } from 'react';
import { NormalizedCoordinates } from '@/types/annotation';

interface CommentInputProps {
  timestamp: number;
  coords: NormalizedCoordinates;
  frame: string;
  onSubmit: (comment: string) => void;
  onCancel: () => void;
  formatTime: (seconds: number) => string;
  position?: { x: number; y: number };
  renderedRect?: { x: number; y: number; width: number; height: number } | null;
}

export function CommentInput({ timestamp, coords, frame, onSubmit, onCancel, formatTime, position, renderedRect }: CommentInputProps) {
  const [comment, setComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!position || !renderedRect) return null;

  const cardX = renderedRect.x + position.x * renderedRect.width + 20;
  const cardY = renderedRect.y + position.y * renderedRect.height - 160;

  return (
    <div
      className="comment-input-card-inline"
      style={{
        left: `${cardX}px`,
        top: `${cardY}px`,
      }}
    >
      <div className="comment-preview">
        <img src={frame} alt="Captured frame" className="frame-thumbnail" />
        <div className="preview-info">
          <div className="timestamp">{formatTime(timestamp)}</div>
          <div className="coords">
            X: {(coords.x * 100).toFixed(1)}% 
            Y: {(coords.y * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter comment... (Ctrl/Cmd+Enter to save, Esc to cancel)"
          rows={2}
          className="comment-textarea-inline"
        />
        <div className="comment-actions-inline">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={!comment.trim()}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}