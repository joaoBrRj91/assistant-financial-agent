import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '../utils/renderMarkdown.js'

describe('renderMarkdown', () => {
  it('converts **bold** to <strong>bold</strong>', () => {
    expect(renderMarkdown('**text**')).toBe('<strong>text</strong>')
  })

  it('converts multiple bold spans in one string', () => {
    expect(renderMarkdown('**a** and **b**')).toBe('<strong>a</strong> and <strong>b</strong>')
  })

  it('converts newlines to <br>', () => {
    expect(renderMarkdown('line1\nline2')).toBe('line1<br>line2')
  })

  it('escapes < and > to prevent XSS', () => {
    expect(renderMarkdown('<script>')).toBe('&lt;script&gt;')
  })

  it('escapes & to &amp;', () => {
    expect(renderMarkdown('a & b')).toBe('a &amp; b')
  })

  it('returns plain text unchanged when no markdown is present', () => {
    expect(renderMarkdown('Olá, tudo bem?')).toBe('Olá, tudo bem?')
  })

  it('bold marker does not match across newlines', () => {
    const result = renderMarkdown('**line1\nline2**')
    expect(result).not.toContain('<strong>')
  })
})
