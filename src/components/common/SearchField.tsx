import type { InputHTMLAttributes } from 'react'

export function SearchField({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <label className={`search-field ${className}`.trim()}><span aria-hidden="true">⌕</span><input type="search" placeholder="검색어를 입력하세요" {...props} /></label>
}
