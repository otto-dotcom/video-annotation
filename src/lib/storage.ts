import { Annotation } from '@/types/annotation';

const STORAGE_KEY = 'video-annotations';

export function getAnnotations(): Annotation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveAnnotations(annotations: Annotation[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  } catch (error) {
    console.error('Failed to save annotations:', error);
  }
}

export function addAnnotation(annotation: Annotation): void {
  const annotations = getAnnotations();
  annotations.push(annotation);
  saveAnnotations(annotations);
}

export function updateAnnotation(id: string, updates: Partial<Annotation>): void {
  const annotations = getAnnotations();
  const index = annotations.findIndex(a => a.id === id);
  if (index !== -1) {
    annotations[index] = { ...annotations[index], ...updates };
    saveAnnotations(annotations);
  }
}

export function deleteAnnotation(id: string): void {
  const annotations = getAnnotations().filter(a => a.id !== id);
  saveAnnotations(annotations);
}

export function clearAnnotations(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}