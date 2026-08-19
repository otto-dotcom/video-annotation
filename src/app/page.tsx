'use client';

import { useState, useCallback } from 'react';
import { Annotation } from '@/types/annotation';
import { useVideo } from '@/hooks/useVideo';
import { useAnnotations } from '@/hooks/useAnnotations';
import { formatTime, generateId } from '@/lib/coordinates';
import { VideoPlayer } from '@/components/VideoPlayer';
import { CommentInput } from '@/components/CommentInput';
import { AnnotationList } from '@/components/AnnotationList';
import { DebugPanel } from '@/components/DebugPanel';

export default function Home() {
  const {
    videoRef,
    videoSrc,
    duration,
    currentTime,
    isPlaying,
    videoMetadata,
    loadVideo,
    togglePlay,
    seek,
    captureFrame,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
  } = useVideo();

  const { annotations, isLoaded, createAnnotation, removeAnnotation, clearAll } = useAnnotations();

  const [commentMode, setCommentMode] = useState(false);
  const [pendingClick, setPendingClick] = useState<{
    x: number;
    y: number;
    timestamp: number;
    frame: string;
  } | null>(null);
  const [renderedRect, setRenderedRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleAnnotationClick = useCallback((coords: { x: number; y: number }, timestamp: number, frame: string) => {
    setPendingClick({ x: coords.x, y: coords.y, timestamp, frame });
  }, []);

  const handleCommentSubmit = useCallback((comment: string) => {
    if (!pendingClick) return;

    const annotation: Annotation = {
      id: generateId(),
      timestamp: pendingClick.timestamp,
      x: pendingClick.x,
      y: pendingClick.y,
      frame: pendingClick.frame,
      comment,
      createdAt: new Date().toISOString(),
    };

    createAnnotation(annotation);
    setPendingClick(null);
    setCommentMode(false);
  }, [pendingClick, createAnnotation]);

  const handleCommentCancel = useCallback(() => {
    setPendingClick(null);
    setCommentMode(false);
  }, []);

  const handleSeek = useCallback((timestamp: number) => {
    seek(timestamp);
  }, [seek]);

  const handleDelete = useCallback((id: string) => {
    removeAnnotation(id);
  }, [removeAnnotation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadVideo(file);
      setCommentMode(false);
      setPendingClick(null);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Video Annotation v0</h1>
        <div className="header-controls">
          {!videoSrc && (
            <label className="file-input-label">
              <input type="file" accept="video/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <span>Select Video</span>
            </label>
          )}
        </div>
      </header>

      <main className="app-main">
        <VideoPlayer
          annotations={annotations.map(a => ({ id: a.id, x: a.x, y: a.y, timestamp: a.timestamp }))}
          commentMode={commentMode}
          pendingClick={pendingClick}
          videoRect={renderedRect}
          onAnnotationClick={handleAnnotationClick}
          onToggleCommentMode={() => setCommentMode(!commentMode)}
          commentModeActive={commentMode}
        />

        {pendingClick && commentMode && (
          <CommentInput
            timestamp={pendingClick.timestamp}
            coords={{ x: pendingClick.x, y: pendingClick.y }}
            frame={pendingClick.frame}
            onSubmit={handleCommentSubmit}
            onCancel={handleCommentCancel}
            formatTime={formatTime}
          />
        )}

        <div className="sidebar">
          <AnnotationList
            annotations={annotations}
            onSeek={handleSeek}
            onDelete={handleDelete}
            formatTime={formatTime}
          />
        </div>
      </main>

      <DebugPanel
        annotations={annotations}
        currentTime={currentTime}
        duration={duration}
        videoMetadata={videoMetadata}
        renderedRect={renderedRect}
        pendingClick={pendingClick}
        commentMode={commentMode}
        storageCount={isLoaded ? annotations.length : 0}
      />
    </div>
  );
}