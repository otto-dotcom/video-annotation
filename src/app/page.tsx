'use client';

import { useState, useCallback, useMemo } from 'react';
import { Annotation } from '@/types/annotation';
import { useVideo } from '@/hooks/useVideo';
import { useAnnotations } from '@/hooks/useAnnotations';
import { formatTime, generateId } from '@/lib/coordinates';
import { VideoPlayer } from '@/components/VideoPlayer';
import { AnnotationList } from '@/components/AnnotationList';
import { DebugPanel } from '@/components/DebugPanel';

const MARKER_COLORS = [
  '#FF4757', '#00D4AA', '#FFA502', '#747D8C', '#5352ED',
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
];

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

  const { annotations, isLoaded, createAnnotation, updateAnnotation, removeAnnotation, clearAll } = useAnnotations();

  const [commentMode, setCommentMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [renderedRect, setRenderedRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleAnnotationClick = useCallback((coords: { x: number; y: number }, timestamp: number, frame: string, index: number) => {
    const color = MARKER_COLORS[index % MARKER_COLORS.length];
    
    const annotation: Annotation = {
      id: generateId(),
      index,
      timestamp,
      x: coords.x,
      y: coords.y,
      frame,
      comment: '',
      color,
      createdAt: new Date().toISOString(),
    };

    createAnnotation(annotation);
    setSelectedIndex(index);
    setCommentMode(false);
  }, [createAnnotation]);

  const handleSelectAnnotation = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleCommentChange = useCallback((index: number, comment: string) => {
    const annotation = annotations.find(a => a.index === index);
    if (annotation) {
      updateAnnotation(annotation.id, { comment });
    }
  }, [annotations, updateAnnotation]);

  const handleSeek = useCallback((timestamp: number) => {
    seek(timestamp);
  }, [seek]);

  const handleDelete = useCallback((id: string) => {
    const annotation = annotations.find(a => a.id === id);
    if (annotation && selectedIndex === annotation.index) {
      setSelectedIndex(null);
    }
    removeAnnotation(id);
  }, [annotations, selectedIndex, removeAnnotation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadVideo(file);
      setCommentMode(false);
      setSelectedIndex(null);
    }
  };

  const annotationsWithIndex = useMemo(() => 
    annotations.map((a, i) => ({ ...a, index: a.index ?? i })).sort((a, b) => (a.index ?? 0) - (b.index ?? 0)),
    [annotations]
  );

  const selectedAnnotation = annotationsWithIndex.find(a => a.index === selectedIndex);

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
          annotations={annotationsWithIndex}
          commentMode={commentMode}
          selectedIndex={selectedIndex}
          onAnnotationClick={handleAnnotationClick}
          onSelectAnnotation={handleSelectAnnotation}
          videoRect={renderedRect}
          onToggleCommentMode={() => setCommentMode(!commentMode)}
          commentModeActive={commentMode}
        />

        <div className="sidebar">
          {selectedAnnotation && (
            <div className="annotation-editor" style={{ '--marker-color': selectedAnnotation.color } as React.CSSProperties}>
              <div className="editor-header">
                <span className="editor-marker-number">{selectedAnnotation.index + 1}</span>
                <span className="editor-timestamp">{formatTime(selectedAnnotation.timestamp)}</span>
                <button 
                  className="editor-close"
                  onClick={() => setSelectedIndex(null)}
                  title="Close"
                >✕</button>
              </div>
              <textarea
                className="editor-textarea"
                value={selectedAnnotation.comment}
                onChange={(e) => handleCommentChange(selectedAnnotation.index, e.target.value)}
                placeholder="Type your comment here..."
                rows={4}
                spellCheck={false}
              />
              <div className="editor-coords">
                X: {(selectedAnnotation.x * 100).toFixed(1)}%  Y: {(selectedAnnotation.y * 100).toFixed(1)}%
              </div>
              <img 
                src={selectedAnnotation.frame} 
                alt={`Frame at ${formatTime(selectedAnnotation.timestamp)}`}
                className="editor-frame"
              />
            </div>
          )}
          
          {!selectedAnnotation && commentMode && (
            <div className="editor-placeholder">
              <p>Click "Add Comment" then click on the video to create a marker</p>
            </div>
          )}

          {!selectedAnnotation && !commentMode && annotationsWithIndex.length > 0 && (
            <div className="editor-placeholder">
              <p>Click a marker on the video or select from list to edit</p>
            </div>
          )}

          <AnnotationList
            annotations={annotationsWithIndex}
            onSeek={handleSeek}
            onDelete={handleDelete}
            formatTime={formatTime}
            selectedIndex={selectedIndex}
            onSelect={handleSelectAnnotation}
          />
        </div>
      </main>

      <DebugPanel
        annotations={annotationsWithIndex}
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