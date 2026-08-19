'use client';

import { Annotation } from '@/types/annotation';
import { formatTime } from '@/lib/coordinates';

interface AnnotationListProps {
  annotations: Array<Annotation & { index: number }>;
  onSeek: (timestamp: number) => void;
  onDelete: (id: string) => void;
  formatTime: (seconds: number) => string;
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
}

export function AnnotationList({ 
  annotations, 
  onSeek, 
  onDelete, 
  formatTime, 
  selectedIndex = null,
  onSelect,
}: AnnotationListProps) {
  if (annotations.length === 0) {
    return (
      <div className="annotation-list empty">
        <p>No annotations yet. Click "Add Comment" then click on the video to add one.</p>
      </div>
    );
  }

  return (
    <div className="annotation-list">
      <h3>Annotations ({annotations.length})</h3>
      <div className="annotations">
        {annotations.map((annotation) => (
          <div 
            key={annotation.id} 
            className={`annotation-card ${selectedIndex === annotation.index ? 'selected' : ''}`}
            style={{ '--marker-color': annotation.color } as React.CSSProperties}
            onClick={() => onSelect?.(annotation.index)}
          >
            <div className="annotation-header">
              <span className="annotation-marker-badge">{annotation.index + 1}</span>
              <span className="annotation-time">{formatTime(annotation.timestamp)}</span>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(annotation.id);
                }}
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
                <div className="annotation-comment">{annotation.comment || '(no comment)'}</div>
              </div>
            </div>
            <button
              className="seek-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSeek(annotation.timestamp);
              }}
            >
              Seek to {formatTime(annotation.timestamp)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}