'use client';

import { useState, useCallback } from 'react';
import { Annotation } from '@/types/annotation';
import { useVideo } from '@/hooks/useVideo';
import { useAnnotations } from '@/hooks/useAnnotations';
import { formatTime, generateId } from '@/lib/coordinates';
import { VideoPlayer } from '@/components/VideoPlayer';
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
  const [renderedRect, setRenderedRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleAnnotationClick = useCallback((coords: { x: number; y: number }, timestamp: number, frame: string, comment?: string) => {
    if (comment) {
      const annotation: Annotation = {
        id: generateId(),
        timestamp,
        x: coords.x,
        y: coords.y,
        frame,
        comment,
        createdAt: new Date().toISOString(),
      };
      createAnnotation(annotation);
      setCommentMode(false);
    }
  }, [createAnnotation]);

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
          pendingClick={null}
          videoRect={renderedRect}
          onAnnotationClick={handleAnnotationClick}
          onToggleCommentMode={() => setCommentMode(!commentMode)}
          commentModeActive={commentMode}
        />

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
        pendingClick={null}
        commentMode={commentMode}
        storageCount={isLoaded ? annotations.length : 0}
      />
    </div>
  );
}