'use client';

import { Annotation } from '@/types/annotation';
import { formatTime } from '@/lib/coordinates';

interface AnnotationListProps {
  annotations: Annotation[];
  onSeek: (timestamp: number) => void;
  onDelete: (id: string) => void;
  formatTime: (seconds: number) => string;
}

export function AnnotationList({ annotations, onSeek, onDelete, formatTime }: AnnotationListProps) {
  if (annotations.length === 0) {
    return (
      <div className="annotation-list empty">
        <p>No annotations yet. Click "Comment" then click on the video to add one.</p>
      </div>
    );
  }

  return (
    <div className="annotation-list">
      <h3>Annotations ({annotations.length})</h3>
      <div className="annotations">
        {annotations.map((annotation) => (
          <div key={annotation.id} className="annotation-card">
            <div className="annotation-header">
              <span className="annotation-time">{formatTime(annotation.timestamp)}</span>
              <button
                className="delete-btn"
                onClick={() => onDelete(annotation.id)}
                title="Delete annotation"
              >
                ✕
              </button>
            </div>
            <div className="annotation-content">
              <img src={annotation.frame} alt={`Frame at ${formatTime(annotation.timestamp)}`} className="annotation-frame" />
              <div className="annotation-details">
                <div className="coord-row">
                  <span className="coord-label">X:</span>
                  <span className="coord-value">{(annotation.x * 100).toFixed(1)}%</span>
                </div>
                <div className="coord-row">
                  <span className="coord-label">Y:</span>
                  <span className="coord-value">{(annotation.y * 100).toFixed(1)}%</span>
                </div>
                <div className="annotation-comment">{annotation.comment}</div>
              </div>
            </div>
            <button
              className="seek-btn"
              onClick={() => onSeek(annotation.timestamp)}
            >
              Seek to this time
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}