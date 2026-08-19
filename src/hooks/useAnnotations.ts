'use client';

import { useState, useEffect, useCallback } from 'react';
import { Annotation } from '@/types/annotation';
import { getAnnotations, saveAnnotations, addAnnotation, updateAnnotation, deleteAnnotation } from '@/lib/storage';

export function useAnnotations() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = getAnnotations();
    setAnnotations(stored);
    setIsLoaded(true);
  }, []);

  const createAnnotation = useCallback((annotation: Annotation) => {
    addAnnotation(annotation);
    setAnnotations(prev => [...prev, annotation]);
  }, []);

  const updateAnnotationById = useCallback((id: string, updates: Partial<Annotation>) => {
    updateAnnotation(id, updates);
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const removeAnnotation = useCallback((id: string) => {
    deleteAnnotation(id);
    setAnnotations(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    saveAnnotations([]);
    setAnnotations([]);
  }, []);

  return {
    annotations,
    isLoaded,
    createAnnotation,
    updateAnnotation: updateAnnotationById,
    removeAnnotation,
    clearAll,
  };
}