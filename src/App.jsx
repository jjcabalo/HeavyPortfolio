import React from 'react';
import './index.css';

const SlotText = ({ text, isAnimating }) => (
  <span className="flex gap-[0.25em]">
    {text.split(' ').map((word, i) => (
      <span key={i} className="relative overflow-hidden flex flex-col h-[1.2em] leading-[1.2em] inline-flex">
        <span
          className={`ease-out ${isAnimating ? '-translate-y-full transition-transform duration-300' : 'translate-y-0 transition-none'}`}
          style={{ transitionDelay: isAnimating ? `${i * 50}ms` : '0ms' }}
        >{word}</span>
        <span
          className={`absolute top-full ease-out ${isAnimating ? '-translate-y-full transition-transform duration-300' : 'translate-y-0 transition-none'}`}
          style={{ transitionDelay: isAnimating ? `${i * 50}ms` : '0ms' }}
        >{word}</span>
      </span>
    ))}
  </span>
);

const CustomCursor = () => {
  const [pos, setPos] = React.useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = React.useState(false);

  React.useEffect(() => {
    const updatePos = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      const target = e.target;
      setIsPointer(target.closest('a') || target.closest('button') || target.closest('.glass-card'));
    };

    window.addEventListener('mousemove', updatePos);
    return () => window.removeEventListener('mousemove', updatePos);
  }, []);

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-3 h-3 bg-[#ffd500] rounded-full pointer-events-none z-[100] mix-blend-difference transition-transform duration-100 ease-out`}
        style={{ transform: `translate(${pos.x - 6}px, ${pos.y - 6}px) scale(${isPointer ? 1.5 : 1})` }}
      />
      <div
        className={`fixed top-0 left-0 w-10 h-10 border border-[#ffd500]/50 rounded-full pointer-events-none z-[100] transition-all duration-300 ease-out ${isPointer ? 'opacity-20 scale-150' : 'opacity-100'}`}
        style={{ transform: `translate(${pos.x - 20}px, ${pos.y - 20}px)` }}
      />
    </>
  );
};


const DesktopNotice = () => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-xl lg:hidden animate-fade-in">
      <div className="glass-card relative flex flex-col items-start p-10 max-w-[26.25rem] w-full animate-others delay-300">
        <img
          src="/jyellow.png"
          alt="J Logo"
          className="w-14 h-16 object-contain mb-8"
        />
        <h3 className="text-4xl font-black text-white leading-tight mb-4 tracking-tighter">
          Viewport<br />Restricted.
        </h3>
        <p className="text-[#999] text-sm leading-relaxed mb-10 font-medium">
          This experience relies on a wider viewport. For the intended layout and smooth animations, please expand your window or switch to a PC.
        </p>

        <div className="flex items-center gap-3 self-end text-[#666] text-xs font-bold tracking-[0.2em] uppercase select-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          Desktop Only
        </div>
      </div>
    </div>
  );
};

const NavLink = ({ href, text, disableHover }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleMouseEnter = () => {
    if (disableHover || isAnimating) return;
    setIsAnimating(true);
    const maxDelay = (text.split(' ').length - 1) * 50;
    setTimeout(() => setIsAnimating(false), 300 + maxDelay + 50);
  };

  return (
    <a href={href} className="group text-white" onMouseEnter={handleMouseEnter}>
      {disableHover ? text : <SlotText text={text} isAnimating={isAnimating} />}
    </a>
  );
};

const InteractiveWord = ({ children }) => {
  return (
    <span className="relative inline-block group cursor-pointer">
      <span className="invisible">{children}</span>
      <span className="absolute top-0 left-0 whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:text-[#ffd500] group-hover:font-['Playfair_Display',serif] group-hover:italic group-hover:scale-[1.03] group-hover:-rotate-1 origin-center">
        {children}
      </span>
    </span>
  );
};

function App() {
  React.useEffect(() => {
    let lastRatio = window.devicePixelRatio;
    const handleResize = () => {
      if (window.devicePixelRatio !== lastRatio) {
        window.location.reload();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden bg-studio-rays">
      <CustomCursor />
      <DesktopNotice />
      {/* Background Text & Nav Container (Locks them together) */}
      <div className="absolute top-[-5%] w-full flex flex-col items-center z-0 pointer-events-none">
        <h1 className="animate-john-container text-[35vw] font-black text-[#ffd500]/80 leading-none whitespace-nowrap select-none tracking-tighter ml-[-0.8vw] flex justify-center">
          {"JOHN".split("").map((char, index) => (
            <span key={index} className="inline-flex overflow-hidden pb-[2vw] mb-[-2vw] px-[1vw] mx-[-1vw]">
              <span className="animate-john inline-block leading-none" style={{ animationDelay: `${index * 100}ms` }}>{char}</span>
            </span>
          ))}
        </h1>
        <div className="w-full mt-[-2vw] px-16 pointer-events-auto overflow-hidden">
          <header className="w-full flex justify-between text-base font-bold tracking-wide animate-john delay-1200">
            <nav className="flex items-center gap-6">
              <NavLink href="#home" text="HOME" disableHover={true} />
              <span className="text-white font-light">|</span>
              <NavLink href="#about" text="ABOUT ME" />
              <span className="text-white font-light">|</span>
              <NavLink href="#experiences" text="EXPERIENCES" />
            </nav>
            <nav className="flex items-center gap-6">
              <NavLink href="#projects" text="PROJECTS" />
              <span className="text-white font-light">|</span>
              <NavLink href="#certifications" text="CERTIFICATIONS" />
              <span className="text-white font-light">|</span>
              <NavLink href="#faqs" text="FAQS" />
            </nav>
          </header>
        </div>
      </div>

      {/* Main Image */}
      <img src="/HeroImage2.png" alt="John" className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[100vh] z-10 object-contain pointer-events-none animate-others delay-1400"
        style={{ WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 60%, transparent 100%)', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 60%, transparent 100%)' }} />

      {/* Editorial Hero Details */}
      <div className="absolute bottom-14 left-14 z-20 text-lg leading-relaxed font-medium text-[#aaa]">
        <div className="overflow-hidden"><p className="animate-john delay-1600">Designed with purpose.</p></div>
        <div className="overflow-hidden"><p className="animate-john" style={{ animationDelay: '1750ms' }}>Built by John.</p></div>
      </div>

      <div className="absolute bottom-14 right-14 z-20 text-lg leading-relaxed font-medium text-right text-[#aaa]">
        <div className="overflow-hidden flex justify-end"><p className="animate-john delay-1600">Building ideas worth seeing.</p></div>
        <div className="overflow-hidden flex justify-end"><p className="animate-john" style={{ animationDelay: '1750ms' }}>Designs worth feeling.</p></div>
        <div className="overflow-hidden flex justify-end"><p className="animate-john" style={{ animationDelay: '1900ms' }}>Experiences worth remembering.</p></div>
      </div>
      {/* Bottom Content Overlays */}
      <div className="relative z-20 flex justify-center gap-16 items-end px-16 pb-16 h-full w-full pointer-events-none">

        {/* Left Side Cards */}
        <div className="flex flex-col gap-6 w-fit z-20 pointer-events-auto">
          <div className="glass-card flex items-center gap-6 p-6 w-[15rem] -ml-12 animate-others delay-2000">
            <img
              src="/jyellow.png"
              alt="J Logo"
              className="w-[3.625rem] h-[4.5rem] object-contain shrink-0"
            />
            <div className="text-base leading-tight text-white whitespace-nowrap">
              <strong className="text-3xl">10+</strong><br />
              Projects Made
            </div>
          </div>

          <div className="glass-card flex flex-col items-center justify-center gap-2 p-6 w-fit min-w-[8.75rem] animate-others delay-2000">
            <div className="text-7xl font-black text-accent-yellow leading-none">
              4+
            </div>
            <div className="text-base leading-tight text-white text-center whitespace-nowrap">
              Years of<br />Designing
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-start gap-8 mb-8 z-20 pointer-events-auto">
          <h2 className="text-left text-white text-7xl font-black leading-[1.1] drop-shadow-[2px_2px_10px_rgba(0,0,0,0.8)] animate-others delay-2000 select-none">
            <InteractiveWord>Portfolio</InteractiveWord><br />
            <InteractiveWord>Built</InteractiveWord> <InteractiveWord>To</InteractiveWord><br />
            <InteractiveWord>Experience.</InteractiveWord>
          </h2>

        </div>

        {/* Right Side Cards */}
        <div className="flex flex-col gap-8 items-end w-fit pointer-events-auto -translate-y-3">
          <div className="glass-card w-fit p-6 -translate-y-3 animate-others delay-2000">
            <ul className="flex flex-col gap-4 w-full list-none whitespace-nowrap">
              <li className="flex items-center gap-4 font-semibold text-base text-white">
                <svg className="w-8 h-8 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,12 L20.66,7 A10,10 0 1,0 20.66,17 Z" />
                </svg>
                Creative
              </li>

              <li className="flex items-center gap-4 font-semibold text-base text-white">
                <svg className="w-8 h-8 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="7" cy="7" r="5" />
                  <circle cx="17" cy="7" r="5" />
                  <circle cx="7" cy="17" r="5" />
                  <circle cx="17" cy="17" r="5" />
                </svg>
                Detail-Oriented
              </li>

              <li className="flex items-center gap-4 font-semibold text-base text-white">
                <svg className="w-8 h-8 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 8 v10 a2 2 0 0 0 2 2 h16 a2 2 0 0 0 2-2 v-10 a2 2 0 0 0-4 0 v6 h-4 v-8 a2 2 0 0 0-4 0 v8 h-4 v-6 a2 2 0 0 0-4 0 z" />
                </svg>
                Unique
              </li>

              <li className="flex items-center gap-4 font-semibold text-base text-white">
                <svg className="w-8 h-8 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3 L3 9.5 L12 15 L21 9.5 Z" />
                  <path d="M12 11 L3 17.5 L12 23 L21 17.5 Z" />
                </svg>
                Builder
              </li>

              <li className="flex items-center gap-4 font-semibold text-base text-white">
                <svg className="w-8 h-8 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="7" cy="7" r="5" />
                  <circle cx="17" cy="7" r="5" />
                  <circle cx="7" cy="17" r="5" />
                  <circle cx="17" cy="17" r="5" />
                  <rect x="7" y="7" width="10" height="10" />
                </svg>
                Playful
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
