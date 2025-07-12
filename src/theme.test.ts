import { describe, it, expect } from 'vitest';
import { theme } from './theme';

describe('theme', () => {
  it('should have all required color palettes', () => {
    expect(theme.colors).toHaveProperty('primary');
    expect(theme.colors).toHaveProperty('secondary');
    expect(theme.colors).toHaveProperty('accent');
    expect(theme.colors).toHaveProperty('success');
    expect(theme.colors).toHaveProperty('warning');
    expect(theme.colors).toHaveProperty('error');
  });

  it('should have proper color structure with all shades', () => {
    const colorPalettes = ['primary', 'secondary', 'accent', 'success', 'warning', 'error'];
    
    colorPalettes.forEach(palette => {
      const colorPalette = theme.colors[palette as keyof typeof theme.colors];
      expect(colorPalette).toHaveProperty('50');
      expect(colorPalette).toHaveProperty('100');
      expect(colorPalette).toHaveProperty('500');
      expect(colorPalette).toHaveProperty('900');
      expect(colorPalette).toHaveProperty('950');
    });
  });

  it('should have spacing configuration', () => {
    expect(theme.spacing).toHaveProperty('xs');
    expect(theme.spacing).toHaveProperty('sm');
    expect(theme.spacing).toHaveProperty('md');
    expect(theme.spacing).toHaveProperty('lg');
    expect(theme.spacing).toHaveProperty('xl');
    expect(theme.spacing).toHaveProperty('2xl');
    expect(theme.spacing).toHaveProperty('3xl');
  });

  it('should have borderRadius configuration', () => {
    expect(theme.borderRadius).toHaveProperty('xs');
    expect(theme.borderRadius).toHaveProperty('sm');
    expect(theme.borderRadius).toHaveProperty('md');
    expect(theme.borderRadius).toHaveProperty('lg');
    expect(theme.borderRadius).toHaveProperty('xl');
    expect(theme.borderRadius).toHaveProperty('2xl');
    expect(theme.borderRadius).toHaveProperty('3xl');
  });

  it('should have fontFamily configuration', () => {
    expect(theme.fontFamily).toHaveProperty('sans');
    expect(theme.fontFamily).toHaveProperty('serif');
    expect(theme.fontFamily).toHaveProperty('mono');
  });

  it('should have fontSize configuration', () => {
    expect(theme.fontSize).toHaveProperty('xs');
    expect(theme.fontSize).toHaveProperty('sm');
    expect(theme.fontSize).toHaveProperty('base');
    expect(theme.fontSize).toHaveProperty('lg');
    expect(theme.fontSize).toHaveProperty('xl');
    expect(theme.fontSize).toHaveProperty('2xl');
    expect(theme.fontSize).toHaveProperty('3xl');
    expect(theme.fontSize).toHaveProperty('4xl');
  });

  it('should have proper color values (hex format)', () => {
    const colorPalettes = ['primary', 'secondary', 'accent', 'success', 'warning', 'error'];
    
    colorPalettes.forEach(palette => {
      const colorPalette = theme.colors[palette as keyof typeof theme.colors];
      Object.values(colorPalette).forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  it('should have proper spacing values (rem format)', () => {
    Object.values(theme.spacing).forEach(spacing => {
      expect(spacing).toMatch(/^\d+(\.\d+)?rem$/);
    });
  });

  it('should have proper borderRadius values (rem format)', () => {
    Object.values(theme.borderRadius).forEach(radius => {
      expect(radius).toMatch(/^\d+(\.\d+)?rem$/);
    });
  });

  it('should have proper fontSize structure', () => {
    Object.values(theme.fontSize).forEach(fontSize => {
      expect(Array.isArray(fontSize)).toBe(true);
      expect(fontSize).toHaveLength(2);
      expect(typeof fontSize[0]).toBe('string');
      expect(typeof fontSize[1]).toBe('object');
      expect(fontSize[1]).toHaveProperty('lineHeight');
    });
  });
}); 
