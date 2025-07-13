import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDragAndDrop } from './useDragAndDrop';

describe('useDragAndDrop', () => {
  it('should initialize with default drag state', () => {
    const onTileMove = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(onTileMove));

    expect(result.current.dragState).toEqual({
      isDragging: false,
      draggedTileId: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      dropZone: null,
    });
  });

  it('should start drag with correct state', () => {
    const onTileMove = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(onTileMove));

    act(() => {
      result.current.startDrag('tile-1', { x: 100, y: 200 });
    });

    expect(result.current.dragState).toEqual({
      isDragging: true,
      draggedTileId: 'tile-1',
      startPosition: { x: 100, y: 200 },
      currentPosition: { x: 100, y: 200 },
      dropZone: null,
    });
  });

  it('should update drag position', () => {
    const onTileMove = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(onTileMove));

    act(() => {
      result.current.startDrag('tile-1', { x: 100, y: 200 });
    });

    act(() => {
      result.current.updateDrag({ x: 150, y: 250 });
    });

    expect(result.current.dragState.currentPosition).toEqual({ x: 150, y: 250 });
    expect(result.current.dragState.startPosition).toEqual({ x: 100, y: 200 });
  });

  it('should end drag and call onTileMove when dropZone is set', () => {
    const onTileMove = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(onTileMove));

    act(() => {
      result.current.startDrag('tile-1', { x: 100, y: 200 });
    });

    // Set drop zone
    act(() => {
      result.current.dragState.dropZone = { x: 300, y: 400 };
    });

    act(() => {
      result.current.endDrag();
    });

    expect(onTileMove).toHaveBeenCalledWith('tile-1', { x: 300, y: 400 });
    expect(result.current.dragState.isDragging).toBe(false);
    expect(result.current.dragState.draggedTileId).toBe(null);
  });

  it('should not call onTileMove when no dropZone is set', () => {
    const onTileMove = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(onTileMove));

    act(() => {
      result.current.startDrag('tile-1', { x: 100, y: 200 });
    });

    act(() => {
      result.current.endDrag();
    });

    expect(onTileMove).not.toHaveBeenCalled();
    expect(result.current.dragState.isDragging).toBe(false);
  });

  it('should cancel drag and reset state', () => {
    const onTileMove = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(onTileMove));

    act(() => {
      result.current.startDrag('tile-1', { x: 100, y: 200 });
    });

    act(() => {
      result.current.updateDrag({ x: 150, y: 250 });
    });

    act(() => {
      result.current.cancelDrag();
    });

    expect(result.current.dragState).toEqual({
      isDragging: false,
      draggedTileId: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      dropZone: null,
    });
    expect(onTileMove).not.toHaveBeenCalled();
  });

  it('should return all required functions', () => {
    const onTileMove = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(onTileMove));

    expect(typeof result.current.startDrag).toBe('function');
    expect(typeof result.current.updateDrag).toBe('function');
    expect(typeof result.current.endDrag).toBe('function');
    expect(typeof result.current.cancelDrag).toBe('function');
  });

  it('should handle multiple drag operations', () => {
    const onTileMove = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(onTileMove));

    // First drag
    act(() => {
      result.current.startDrag('tile-1', { x: 100, y: 200 });
    });

    act(() => {
      result.current.cancelDrag();
    });

    // Second drag
    act(() => {
      result.current.startDrag('tile-2', { x: 300, y: 400 });
    });

    expect(result.current.dragState.draggedTileId).toBe('tile-2');
    expect(result.current.dragState.startPosition).toEqual({ x: 300, y: 400 });
  });

  it('should maintain drag state during updates', () => {
    const onTileMove = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(onTileMove));

    act(() => {
      result.current.startDrag('tile-1', { x: 100, y: 200 });
    });

    act(() => {
      result.current.updateDrag({ x: 150, y: 250 });
    });

    act(() => {
      result.current.updateDrag({ x: 200, y: 300 });
    });

    expect(result.current.dragState.isDragging).toBe(true);
    expect(result.current.dragState.draggedTileId).toBe('tile-1');
    expect(result.current.dragState.startPosition).toEqual({ x: 100, y: 200 });
    expect(result.current.dragState.currentPosition).toEqual({ x: 200, y: 300 });
  });
});
