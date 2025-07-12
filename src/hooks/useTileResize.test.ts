import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTileResize } from './useTileResize';

describe('useTileResize', () => {
  it('should initialize with default resize state', () => {
    const onTileResize = vi.fn();
    const { result } = renderHook(() => useTileResize(onTileResize));

    expect(result.current.resizeState).toEqual({
      isResizing: false,
      resizingTileId: null,
      startSize: 'medium',
      currentSize: 'medium',
      resizeDirection: 'both',
    });
  });

  it('should start resize with correct state', () => {
    const onTileResize = vi.fn();
    const { result } = renderHook(() => useTileResize(onTileResize));

    act(() => {
      result.current.startResize('tile-1', 'horizontal', 'small');
    });

    expect(result.current.resizeState).toEqual({
      isResizing: true,
      resizingTileId: 'tile-1',
      startSize: 'small',
      currentSize: 'small',
      resizeDirection: 'horizontal',
    });
  });

  it('should update resize size', () => {
    const onTileResize = vi.fn();
    const { result } = renderHook(() => useTileResize(onTileResize));

    act(() => {
      result.current.startResize('tile-1', 'vertical', 'medium');
    });

    act(() => {
      result.current.updateResize('large');
    });

    expect(result.current.resizeState.currentSize).toBe('large');
    expect(result.current.resizeState.startSize).toBe('medium');
  });

  it('should end resize and call onTileResize', () => {
    const onTileResize = vi.fn();
    const { result } = renderHook(() => useTileResize(onTileResize));

    act(() => {
      result.current.startResize('tile-1', 'both', 'small');
    });

    act(() => {
      result.current.updateResize('large');
    });

    act(() => {
      result.current.endResize();
    });

    expect(onTileResize).toHaveBeenCalledWith('tile-1', 'large');
    expect(result.current.resizeState.isResizing).toBe(false);
    expect(result.current.resizeState.resizingTileId).toBe(null);
  });

  it('should not call onTileResize when no tile is being resized', () => {
    const onTileResize = vi.fn();
    const { result } = renderHook(() => useTileResize(onTileResize));

    act(() => {
      result.current.endResize();
    });

    expect(onTileResize).not.toHaveBeenCalled();
    expect(result.current.resizeState.isResizing).toBe(false);
  });

  it('should cancel resize and reset state', () => {
    const onTileResize = vi.fn();
    const { result } = renderHook(() => useTileResize(onTileResize));

    act(() => {
      result.current.startResize('tile-1', 'horizontal', 'small');
    });

    act(() => {
      result.current.updateResize('large');
    });

    act(() => {
      result.current.cancelResize();
    });

    expect(result.current.resizeState).toEqual({
      isResizing: false,
      resizingTileId: null,
      startSize: 'medium',
      currentSize: 'medium',
      resizeDirection: 'both',
    });
    expect(onTileResize).not.toHaveBeenCalled();
  });

  it('should return all required functions', () => {
    const onTileResize = vi.fn();
    const { result } = renderHook(() => useTileResize(onTileResize));

    expect(typeof result.current.startResize).toBe('function');
    expect(typeof result.current.updateResize).toBe('function');
    expect(typeof result.current.endResize).toBe('function');
    expect(typeof result.current.cancelResize).toBe('function');
  });

  it('should handle multiple resize operations', () => {
    const onTileResize = vi.fn();
    const { result } = renderHook(() => useTileResize(onTileResize));

    // First resize
    act(() => {
      result.current.startResize('tile-1', 'horizontal', 'small');
    });

    act(() => {
      result.current.cancelResize();
    });

    // Second resize
    act(() => {
      result.current.startResize('tile-2', 'vertical', 'large');
    });

    expect(result.current.resizeState.resizingTileId).toBe('tile-2');
    expect(result.current.resizeState.startSize).toBe('large');
    expect(result.current.resizeState.resizeDirection).toBe('vertical');
  });

  it('should maintain resize state during updates', () => {
    const onTileResize = vi.fn();
    const { result } = renderHook(() => useTileResize(onTileResize));

    act(() => {
      result.current.startResize('tile-1', 'both', 'small');
    });

    act(() => {
      result.current.updateResize('medium');
    });

    act(() => {
      result.current.updateResize('large');
    });

    expect(result.current.resizeState.isResizing).toBe(true);
    expect(result.current.resizeState.resizingTileId).toBe('tile-1');
    expect(result.current.resizeState.startSize).toBe('small');
    expect(result.current.resizeState.currentSize).toBe('large');
    expect(result.current.resizeState.resizeDirection).toBe('both');
  });

  it('should handle different resize directions', () => {
    const onTileResize = vi.fn();
    const { result } = renderHook(() => useTileResize(onTileResize));

    act(() => {
      result.current.startResize('tile-1', 'horizontal', 'medium');
    });

    expect(result.current.resizeState.resizeDirection).toBe('horizontal');

    act(() => {
      result.current.cancelResize();
    });

    act(() => {
      result.current.startResize('tile-2', 'vertical', 'medium');
    });

    expect(result.current.resizeState.resizeDirection).toBe('vertical');
  });

  it('should handle empty updateResize parameter', () => {
    const onTileResize = vi.fn();
    const { result } = renderHook(() => useTileResize(onTileResize));

    act(() => {
      result.current.startResize('tile-1', 'both', 'small');
    });

    act(() => {
      result.current.updateResize('');
    });

    expect(result.current.resizeState.currentSize).toBe('small'); // Should keep previous size
  });
}); 
