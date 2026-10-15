export default function AuctionCTA({
  label = 'Đăng ký tham gia',
  variant = 'green',
  disabled = false,
  onClick,
  className = '',
}) {
  const styles = {
    green: 'bg-[#056F1C] text-white hover:bg-[#045517]',
    white: 'bg-white text-[#056F1C] hover:bg-[#E8F5EB]',
    gray: 'bg-white/25 text-white/70 cursor-not-allowed',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[220px] rounded-lg px-7 py-3 text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#056F1C] ${styles[variant] ?? styles.green} ${className}`}
    >
      {label}
    </button>
  )
}
