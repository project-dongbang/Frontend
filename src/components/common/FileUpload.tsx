import type { InputHTMLAttributes } from 'react'

export function FileUpload({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <label className={`file-upload ${className}`.trim()}><input type="file" accept="image/png,image/jpeg,image/webp" {...props} /><b aria-hidden="true">▧</b><strong>영수증 사진을 올려주세요</strong><span>사진을 끌어 놓거나 파일을 선택하세요.</span><small>JPG · PNG · WEBP / 최대 3MB</small></label>
}
