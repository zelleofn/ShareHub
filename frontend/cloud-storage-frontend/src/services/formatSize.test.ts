import formatSize from '../utils/formatSize';

describe('formatSize', () => {
  it('formats bytes correctly', () => {
    expect(formatSize(1024)).toBe('1 KB');
    expect(formatSize(1048576)).toBe('1 MB');
  });

  it('handles zero', () => {
    expect(formatSize(0)).toBe('0 B');
  });

  it('handles large values', () => {
    expect(formatSize(1073741824)).toBe('1 GB');
  });
});
