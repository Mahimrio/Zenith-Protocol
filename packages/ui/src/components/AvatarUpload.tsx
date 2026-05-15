import { useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import type React from 'react'

interface AvatarUploadProps {
  currentUrl: string | null
  userName: string
  onUpload: (file: File) => void
  isUploading?: boolean
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentUrl,
  userName,
  onUpload,
  isUploading = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const spinnerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Sync external prop changes
    setPreviewUrl(null)
  }, [currentUrl])

  useEffect(() => {
    let ctx: gsap.Context
    if (containerRef.current) {
      ctx = gsap.context(() => {
        const el = containerRef.current
        if (!el) return
        el.addEventListener('mouseenter', () => {
          gsap.to(el, { scale: 1.05, duration: 0.2, ease: 'power2.out' })
        })
        el.addEventListener('mouseleave', () => {
          gsap.to(el, { scale: 1, duration: 0.2, ease: 'power2.out' })
        })
      })
    }
    return () => ctx && ctx.revert()
  }, [])

  useEffect(() => {
    let tween: gsap.core.Tween | null = null
    if (isUploading && spinnerRef.current) {
      tween = gsap.to(spinnerRef.current, {
        rotation: 360,
        repeat: -1,
        duration: 1,
        ease: 'none',
      })
    }
    return () => {
      if (tween) tween.kill()
    }
  }, [isUploading])

  const handleClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Local preview
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPreviewUrl(ev.target.result as string)
        }
      }
      reader.readAsDataURL(file)

      // Notify parent
      onUpload(file)
    }
    // Reset input value so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const displayUrl = previewUrl || currentUrl

  return (
    <div
      ref={containerRef}
      className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer bg-bg-secondary border-2 border-border-glass shadow-[0_0_15px_rgba(139,92,246,0.2)] flex-shrink-0"
      onClick={handleClick}
      title="Upload new avatar"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {displayUrl ? (
        <img
          src={displayUrl}
          alt={`${userName} avatar`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-purple-900/40 text-white text-2xl font-bold font-mono">
          {getInitials(userName)}
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
          <div
            ref={spinnerRef}
            className="w-8 h-8 rounded-full border-4 border-neon-purple border-t-transparent"
          />
        </div>
      )}
    </div>
  )
}
