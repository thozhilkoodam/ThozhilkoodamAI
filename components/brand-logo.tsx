import Image from 'next/image'
import Link from 'next/link'

const sizeMap = {
  small: {
    img: 48,
    english: 'text-[11px] sm:text-xs tracking-[0.15em] font-semibold',
    tamil: 'text-sm sm:text-base font-bold',
    tagline: 'hidden',
  },
  medium: {
    img: 72,
    english: 'text-sm sm:text-base tracking-[0.15em] font-semibold',
    tamil: 'text-lg sm:text-xl font-bold',
    tagline: 'text-xs sm:text-sm',
  },
  large: {
    img: 100,
    english: 'text-base sm:text-lg tracking-[0.2em] font-semibold',
    tamil: 'text-xl sm:text-2xl font-bold',
    tagline: 'text-sm sm:text-base',
  },
}

const variantConfig = {
  default: { href: '/' },
  admin: { href: '/admin/dashboard' },
}

export function BrandLogo({
  size = 'medium',
  variant = 'default',
  showTagline,
  href: customHref,
}: {
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'admin'
  showTagline?: boolean
  href?: string
}) {
  const s = sizeMap[size]
  const config = variantConfig[variant]
  const showTag = showTagline ?? variant !== 'admin'
  const linkHref = customHref || config.href

  return (
    <Link href={linkHref} className="flex items-center gap-2 sm:gap-3 group">
      <div className="relative shrink-0">
        <Image
          src="/logo.png"
          alt="Thozhil Koodam"
          width={s.img}
          height={s.img}
          className="rounded-xl"
          priority
        />
      </div>
      <div className="leading-tight">
        <h1 className={`${s.english} uppercase text-foreground`}>
          THOZHIL KOODAM
        </h1>
        <p className={`${s.tamil} text-foreground -mt-0.5`}>
          தொழில் கூடம்
        </p>
        {showTag && s.tagline !== 'hidden' && (
          <p className={`${s.tagline} text-muted-foreground hidden md:block`}>
            One Platform for Every Opportunity
          </p>
        )}
      </div>
    </Link>
  )
}
