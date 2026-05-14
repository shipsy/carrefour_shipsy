import { useLanguage } from '../../hooks/useLanguage';
import type { Language } from '../../types';

interface Props {
  cartTotal: number;
  cartItemCount: number;
  lang: Language;
  onLangChange: (l: Language) => void;
}

const navKeys = ['products', 'promotions', 'folders', 'recipes'] as const;

export default function CarrefourHeader({ cartTotal, cartItemCount, lang, onLangChange }: Props) {
  const { t } = useLanguage();

  return (
    <header
      className="bg-white sticky top-0 z-30"
      style={{ borderBottom: '1px solid var(--color-cf-border)' }}
    >
      <div className="max-w-[1200px] mx-auto flex items-center gap-[18px] px-[18px] py-[14px]">
        {/* Logo - text only, matching prototype */}
        <div className="flex items-center gap-1.5 shrink-0 font-extrabold text-lg" style={{ color: 'var(--color-cf-blue)' }}>
          Carrefour
        </div>

        {/* Nav tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navKeys.map((key, i) => (
            <button
              key={key}
              type="button"
              className="px-[14px] py-2 rounded-lg font-semibold text-sm transition-colors"
              style={
                i === 0
                  ? { background: '#EAF2FB', color: 'var(--color-cf-blue)' }
                  : { background: 'transparent', color: 'var(--color-cf-text, #1B2330)' }
              }
            >
              {i === 0 ? `▦ ${t(key)}` : t(key)}
            </button>
          ))}
        </nav>

        {/* Search bar */}
        <div
          className="hidden sm:flex flex-1 max-w-[520px] items-center bg-white overflow-hidden"
          style={{ border: '1px solid var(--color-cf-border)', borderRadius: '30px' }}
        >
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="flex-1 border-none outline-none px-[14px] py-[10px] text-sm bg-transparent"
            style={{ color: 'var(--color-cf-text, #1B2330)' }}
          />
          <button
            type="button"
            className="text-white px-4 py-[10px] text-sm inline-flex items-center gap-1.5"
            style={{ background: 'var(--color-cf-blue)' }}
          >
            🔍
          </button>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Language globe */}
          <button
            type="button"
            className="w-10 h-10 rounded-full inline-flex items-center justify-center hover:bg-gray-100 relative"
            onClick={() => onLangChange(lang === 'en' ? 'nl' : 'en')}
            title="Change language"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3a13 13 0 0 1 0 18" />
              <path d="M12 3a13 13 0 0 0 0 18" />
            </svg>
            <span
              className="absolute font-extrabold text-white rounded"
              style={{
                bottom: '6px',
                right: '4px',
                background: 'var(--color-cf-blue)',
                fontSize: '9px',
                padding: '1px 4px',
                lineHeight: 1.1,
                letterSpacing: '0.3px',
              }}
            >
              {lang.toUpperCase()}
            </span>
          </button>

          {/* Orders clipboard */}
          <button
            type="button"
            className="w-10 h-10 rounded-full inline-flex items-center justify-center hover:bg-gray-100"
            title="My orders & lists"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="12" height="17" rx="2" />
              <path d="M9 4h6v3H9z" fill="currentColor" stroke="currentColor" />
              <path d="M9 12.5l2 2 4-4" />
            </svg>
          </button>

          {/* Account person */}
          <button
            type="button"
            className="w-10 h-10 rounded-full inline-flex items-center justify-center hover:bg-gray-100"
            title="My account"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.5 3.6-7 8-7s8 2.5 8 7" />
            </svg>
          </button>

          {/* Cart pill */}
          <button
            type="button"
            className="inline-flex items-center gap-2 text-white font-bold relative ml-1"
            style={{
              background: 'var(--color-cf-blue)',
              padding: '8px 14px',
              borderRadius: '24px',
            }}
            title="My basket"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2.5l2.5 12.5a2 2 0 0 0 2 1.5h7.5a2 2 0 0 0 2-1.5L21 8H6.5" />
              <circle cx="10" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
            </svg>
            {cartItemCount > 0 && (
              <span
                className="absolute inline-flex items-center justify-center font-extrabold text-white"
                style={{
                  top: '-4px',
                  left: '14px',
                  background: 'var(--color-cf-red)',
                  fontSize: '11px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 5px',
                  borderRadius: '9px',
                  border: '2px solid #fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,.15)',
                  lineHeight: 1,
                }}
              >
                {cartItemCount}
              </span>
            )}
            <span>&euro; {cartTotal.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
