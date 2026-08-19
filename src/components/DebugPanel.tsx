'use client';

import { Annotation } from '@/types/annotation';
import { formatTime } from '@/lib/coordinates';

interface DebugPanelProps {
  annotations: Annotation[];
  currentTime: number;
  duration: number;
  videoMetadata: { width: number; height: number } | null;
  renderedRect: { x: number; y: number; width: number; height: number } | null;
  pendingClick: { x: number; y: number; timestamp: number; frame: string } | null;
  commentMode: boolean;
  storageCount: number;
}

export function DebugPanel({
  annotations,
  currentTime,
  duration,
  videoMetadata,
  renderedRect,
  pendingClick,
  commentMode,
  storageCount,
}: DebugPanelProps) {
  const latest = annotations[annotations.length - 1];

  return (
    <details className="debug-panel">
      <summary>Debug Panel</summary>
      <div className="debug-content">
        <h4>Video State</h4>
        <dl>
          <dt>Current Time</dt>
          <dd>{formatTime(currentTime)} ({currentTime.toFixed(3)}s)</dd>
          <dt>Duration</dt>
          <dd>{formatTime(duration)} ({duration.toFixed(3)}s)</dd>
          <dt>Video Resolution</dt>
          <dd>{videoMetadata ? `${videoMetadata.width} × ${videoMetadata.height}` : 'N/A'}</dd>
          <dt>Rendered Resolution</dt>
          <dd>{renderedRect ? `${Math.round(renderedRect.width)} × ${Math.round(renderedRect.height)}` : 'N/A'}</dd>
          <dt>Rendered Position</dt>
          <dd>{renderedRect ? `x: ${renderedRect.x.toFixed(1)}, y: ${renderedRect.y.toFixed(1)}` : 'N/A'}</dd>
        </dl>

        <h4>Annotation State</h4>
        <dl>
          <dt>Comment Mode</dt>
          <dd>{commentMode ? 'Active' : 'Inactive'}</dd>
          <dt>Pending Click</dt>
          <dd>
            {pendingClick
              ? `X: ${(pendingClick.x * 100).toFixed(1)}% Y: ${(pendingClick.y * 100).toFixed(1)}% @ ${formatTime(pendingClick.timestamp)}`
              : 'None'}
          </dd>
          <dt>Total Annotations</dt>
          <dd>{annotations.length}</dd>
          <dt>Storage Count</dt>
          <dd>{storageCount}</dd>
        </dl>

        {latest && (
          <div className="latest-annotation">
            <h4>Latest Annotation</h4>
            <dl>
              <dt>ID</dt>
              <dd className="mono">{latest.id}</dd>
              <dt>Timestamp</dt>
              <dd>{formatTime(latest.timestamp)} ({latest.timestamp.toFixed(3)}s)</dd>
              <dt>Coordinates</dt>
              <dd>X: {latest.x.toFixed(3)} Y: {latest.y.toFixed(3)}</dd>
              <dt>Comment</dt>
              <dd>{latest.comment}</dd>
              <dt>Created</dt>
              <dd>{latest.createdAt}</dd>
              <dt>Frame</dt>
              <dd>{latest.frame ? 'Captured ✓' : 'Missing ✗'}</dd>
            </dl>
          </div>
        )}

        <h4>All Annotations</h4>
        <pre className="annotations-json">{JSON.stringify(annotations, null, 2)}</pre>
      </div>
    </details>
  );
}