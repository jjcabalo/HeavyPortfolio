import React from 'react';
import './index.css';
import AIChatOverlay from './AIChatOverlay';

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
        className={`fixed top-0 left-0 w-3 h-3 bg-[#ffd500] rounded-full pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100 ease-out`}
        style={{ transform: `translate(${pos.x - 6}px, ${pos.y - 6}px) scale(${isPointer ? 1.5 : 1})` }}
      />
      <div
        className={`fixed top-0 left-0 w-10 h-10 border border-[#ffd500]/50 rounded-full pointer-events-none z-[9999] transition-all duration-300 ease-out ${isPointer ? 'opacity-20 scale-150' : 'opacity-100'}`}
        style={{ transform: `translate(${pos.x - 20}px, ${pos.y - 20}px)` }}
      />
    </>
  );
};


const DesktopNotice = () => {
  return null;
};

const NavLink = ({ href, text, disableHover, onClick, icon }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleMouseEnter = () => {
    if (disableHover || isAnimating) return;
    setIsAnimating(true);
    const maxDelay = (text.split(' ').length - 1) * 50;
    setTimeout(() => setIsAnimating(false), 300 + maxDelay + 50);
  };

  return (
    <a href={href} className="group text-white flex items-center gap-6" onMouseEnter={handleMouseEnter} onClick={onClick}>
      {icon && <span>{icon}</span>}
      {disableHover ? text : <SlotText text={text} isAnimating={isAnimating} />}
    </a>
  );
};

const InteractiveWord = ({ children, isActive }) => {
  return (
    <span className="relative inline-block group cursor-pointer">
      <span className="invisible">{children}</span>
      <span className={`absolute top-0 left-0 whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] origin-center
        ${isActive
          ? "text-[#ffd500] font-['Playfair_Display',serif] italic scale-[1.03] -rotate-1"
          : "lg:group-hover:text-[#ffd500] lg:group-hover:font-['Playfair_Display',serif] lg:group-hover:italic lg:group-hover:scale-[1.03] lg:group-hover:-rotate-1"
        }`}
      >
        {children}
      </span>
    </span>
  );
};

const AnimatedTitle = () => {
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (!isMobile) {
      setActiveIndex(-1);
      return;
    }
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % 4);
    }, 650);
    return () => clearInterval(interval);
  }, [isMobile]);

  return (
    <h2 className="text-left text-white text-[5.5rem] font-black leading-[1.05] drop-shadow-[2px_2px_10px_rgba(0,0,0,0.8)] animate-others delay-2000 select-none mt-16 mb-4 lg:my-0 ml-8 lg:ml-0">
      <InteractiveWord isActive={activeIndex === 0}>Portfolio</InteractiveWord><br />
      <InteractiveWord isActive={activeIndex === 1}>Built</InteractiveWord> <InteractiveWord isActive={activeIndex === 2}>To</InteractiveWord><br />
      <InteractiveWord isActive={activeIndex === 3}>Experience.</InteractiveWord>
    </h2>
  );
};

const SpotlightButton = ({ className = "self-end", text = "Build With Me", href = "https://cal.com/jjcabalo", onClick, icon }) => {
  const buttonRef = React.useRef(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0, tiltX: 0, tiltY: 0, glareAngle: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate realistic 3D tilt based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -10;
    const tiltY = ((x - centerX) / centerX) * 10;

    // Calculate angle for anisotropic glare based on vector from center
    const glareAngle = (Math.atan2(y - centerY, x - centerX) * (180 / Math.PI)) + 90;

    setMousePos({ x, y, tiltX, tiltY, glareAngle });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos(prev => ({ ...prev, tiltX: 0, tiltY: 0 }));
  };

  return (
    <div style={{ perspective: '1000px' }} className={`animate-others delay-2000 ${className}`}>
      <a
        href={href}
        target={href === "#" ? "_self" : "_blank"}
        rel={href === "#" ? "" : "noopener noreferrer"}
        onClick={onClick}
        ref={buttonRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          '--mouse-x': `${mousePos.x}px`,
          '--mouse-y': `${mousePos.y}px`,
          '--glare-angle': `${mousePos.glareAngle}deg`,
          transform: isHovered ? `rotateX(${mousePos.tiltX}deg) rotateY(${mousePos.tiltY}deg) scale(1.03)` : 'rotateX(0deg) rotateY(0deg) scale(1)',
          transition: isHovered ? 'transform 0.1s ease-out, box-shadow 0.5s ease, border-color 0.5s ease' : 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
        className="glass-card overflow-hidden group !rounded-full relative inline-flex items-center justify-center gap-5 py-3.5 pl-8 pr-3.5 max-w-full cursor-pointer border border-white/10 hover:border-white/30 hover:shadow-[inset_0_1px_15px_rgba(255,255,255,0.2),0_15px_40px_rgba(255,255,255,0.1)]"
      >
        {/* 1. Diffuse Ambient Glow (scattering) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 mix-blend-overlay"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(250px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.15), transparent 80%)`
          }}
        />

        {/* 2. Specular Hotspot (glare) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 mix-blend-color-dodge"
          style={{
            opacity: isHovered ? 0.5 : 0,
            background: `radial-gradient(50px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.2), transparent 100%)`
          }}
        />

        {/* 3. Angular Sheen (simulates polished glass reflections, CD-like) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 mix-blend-overlay"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `conic-gradient(from var(--glare-angle) at 50% 50%, transparent 10%, rgba(255,255,255,0.1) 35%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 65%, transparent 90%)`
          }}
        />

        <span className="relative z-10 font-semibold text-2xl lg:text-xl text-white/80 group-hover:text-white transition-colors duration-300 whitespace-nowrap drop-shadow-md">
          {text}
        </span>

        <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white/80 group-hover:text-white transition-all duration-500 group-hover:bg-white/20 group-hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.3),0_0_15px_rgba(255,255,255,0.2)]">
          {icon || (
            <svg className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </a>
    </div>
  );
};

function App() {
  const [isAIChatOpen, setIsAIChatOpen] = React.useState(false);
  const [isLogoVisible, setIsLogoVisible] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      setIsLogoVisible(scrollPos > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="relative w-full max-w-[100vw] min-h-screen lg:h-screen flex flex-col justify-between overflow-x-hidden overflow-y-auto scrollbar-hide lg:overflow-hidden bg-studio-rays">
      <CustomCursor />
      <DesktopNotice />
      <AIChatOverlay isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

      {/* Mobile Top Logo (Left) */}
      <div className={`fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] flex items-center lg:hidden transition-all duration-500 ease-out ${(isLogoVisible || isMobileMenuOpen) ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-4'}`}>
        <div
          className="flex items-center justify-center bg-accent-yellow text-black font-black text-4xl tracking-tighter rounded-2xl px-4"
          style={{ height: '76px' }}
        >
          JERVYS<sup className="text-lg -ml-1 -mt-4">&reg;</sup>
        </div>
      </div>

      {/* Mobile Top Actions (Right) */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100] flex items-center gap-3 lg:hidden">
        <button
          className="glass-card flex items-center justify-center gap-3 cursor-pointer rounded-2xl px-6 group transition-all duration-300 hover:bg-white/5"
          style={{ height: '76px' }}
          onClick={(e) => { e.preventDefault(); setIsAIChatOpen(true); }}
        >
          <span className="font-black text-4xl tracking-tighter lg:font-semibold lg:text-xl lg:tracking-normal text-white/80 group-hover:text-white transition-colors duration-300">
            ASK ME
          </span>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white/80 group-hover:text-white group-hover:bg-white/20 transition-all duration-500">
            <svg className="w-6 h-6 text-accent-yellow transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" clipRule="evenodd">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
            </svg>
          </div>
        </button>
        <button
          className="glass-card flex flex-col items-center justify-center gap-[6px] cursor-pointer rounded-2xl shrink-0 relative z-[110]"
          style={{ width: '76px', height: '76px' }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className={`w-8 h-[2px] bg-white rounded transition-all duration-300 ${isMobileMenuOpen ? 'translate-y-[4px]' : ''}`}></div>
          <div className={`w-8 h-[2px] bg-white rounded transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`}></div>
          <div className={`w-8 h-[2px] bg-white rounded transition-all duration-300 ${isMobileMenuOpen ? '-translate-y-[4px]' : ''}`}></div>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`fixed inset-0 z-[95] lg:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'opacity-100 backdrop-blur-md' : 'opacity-0 backdrop-blur-none'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className={`absolute top-32 right-4 sm:right-6 left-4 sm:left-6 glass-card p-10 flex flex-col items-start gap-8 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
          <nav className="flex flex-col items-start gap-8 font-black text-4xl tracking-tight pointer-events-auto text-white overflow-hidden">
            {[
              { href: "#home", text: "HOME", icon: <svg className="w-10 h-10 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12,12 L20.66,7 A10,10 0 1,0 20.66,17 Z" /></svg> },
              { href: "#about", text: "ABOUT ME", icon: <svg className="w-10 h-10 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="7" r="5" /><circle cx="17" cy="7" r="5" /><circle cx="7" cy="17" r="5" /><circle cx="17" cy="17" r="5" /></svg> },
              { href: "#experiences", text: "EXPERIENCES", icon: <svg className="w-10 h-10 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M2 8 v10 a2 2 0 0 0 2 2 h16 a2 2 0 0 0 2-2 v-10 a2 2 0 0 0-4 0 v6 h-4 v-8 a2 2 0 0 0-4 0 v8 h-4 v-6 a2 2 0 0 0-4 0 z" /></svg> },
              { href: "#projects", text: "PROJECTS", icon: <svg className="w-10 h-10 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 L3 9.5 L12 15 L21 9.5 Z" /><path d="M12 11 L3 17.5 L12 23 L21 17.5 Z" /></svg> },
              { href: "#certifications", text: "CERTIFICATIONS", icon: <svg className="w-10 h-10 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="7" r="5" /><circle cx="17" cy="7" r="5" /><rect x="2" y="12" width="10" height="10" /><circle cx="17" cy="17" r="5" /></svg> }
            ].map((link, i) => (
              <div
                key={link.text}
                className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: isMobileMenuOpen ? `${150 + i * 75}ms` : '0ms' }}
              >
                <NavLink href={link.href} text={link.text} onClick={() => setIsMobileMenuOpen(false)} icon={link.icon} />
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Background Text & Nav Container (Locks them together) */}
      <div className="absolute top-[6%] lg:top-[-5%] w-full flex flex-col items-center z-0 pointer-events-none">
        <h1 className="animate-john-container text-[30vw] font-black text-[#ffd500]/80 leading-none whitespace-nowrap select-none tracking-tighter ml-[-0.8vw] flex justify-center ">
          {"JERVYS".split("").map((char, index) => (
            <span key={index} className="inline-flex overflow-hidden pb-[2vw] mb-[-2vw] px-[1vw] mx-[-1vw]">
              <span className="animate-john inline-block leading-none" style={{ animationDelay: `${index * 145}ms` }}>{char}</span>
            </span>
          ))}
        </h1>
        <div className="w-full mt-[-1vw] lg:mt-[-2vw] px-6 lg:px-16 pointer-events-auto overflow-hidden hidden lg:block">
          <header className="w-full flex justify-between text-xl font-bold tracking-wide animate-john delay-1200">
            <nav className="flex items-center gap-6">
              <NavLink href="#home" text="HOME" disableHover={true} />
              <span className="text-white/60 font-thin text-sm">|</span>
              <NavLink href="#about" text="ABOUT ME" />
              <span className="text-white/60 font-thin text-sm">|</span>
              <NavLink href="#experiences" text="EXPERIENCES" />
            </nav>
            <nav className="flex items-center gap-6">
              <NavLink href="#projects" text="PROJECTS" />
              <span className="text-white/60 font-thin text-sm">|</span>
              <NavLink href="#certifications" text="CERTIFICATIONS" />
              <span className="text-white/60 font-thin text-sm">|</span>
              <NavLink href="#ask-me" text="ASK ME" onClick={(e) => { e.preventDefault(); setIsAIChatOpen(true); }} />
            </nav>
          </header>
        </div>
      </div>

      {/* Main Image */}
      <img src="/HeroImage2.png" alt="John" className="absolute top-20 lg:top-auto lg:bottom-0 left-1/2 -translate-x-1/2 h-[90vh] md:h-[100vh] min-w-[165vw] md:min-w-0 max-w-none z-10 object-contain object-bottom pointer-events-none animate-others delay-1400"
        style={{ WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 60%, transparent 100%), linear-gradient(to bottom, black 60%, transparent 95%)', WebkitMaskComposite: 'source-in', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 60%, transparent 100%), linear-gradient(to bottom, black 60%, transparent 95%)', maskComposite: 'intersect' }} />

      {/* Editorial Hero Details */}
      <div className="absolute bottom-14 left-14 z-20 text-xl leading-relaxed font-medium text-[#aaa] hidden lg:block">
        <div className="overflow-hidden"><p className="animate-john delay-1600">Designed with purpose.</p></div>
        <div className="overflow-hidden"><p className="animate-john" style={{ animationDelay: '1750ms' }}>Built by Jervys.</p></div>
      </div>

      <div className="absolute bottom-14 right-14 z-20 text-xl leading-relaxed font-medium text-right text-[#aaa] hidden lg:block">
        <div className="overflow-hidden flex justify-end"><p className="animate-john delay-1600">Building ideas worth seeing</p></div>
        <div className="overflow-hidden flex justify-end"><p className="animate-john" style={{ animationDelay: '1750ms' }}>Designs worth feeling</p></div>
        <div className="overflow-hidden flex justify-end"><p className="animate-john" style={{ animationDelay: '1900ms' }}>Experiences worth remembering</p></div>
      </div>
      {/* Bottom Content Overlays */}
      <div className="relative z-20 flex flex-col lg:flex-row justify-start lg:justify-center gap-12 lg:gap-16 items-start lg:items-end px-6 lg:px-16 pb-16 h-full w-full pointer-events-none mt-[30vh] lg:mt-0">

        {/* Left Side Cards */}
        <div className="flex flex-col gap-6 w-fit z-20 pointer-events-auto self-start lg:self-auto order-1 lg:order-none lg:-ml-12 mt-20 lg:mt-0 translate-y-24 lg:translate-y-0">
          <div className="glass-card flex items-center gap-6 p-8 lg:p-6 w-[20rem] lg:w-[16rem] animate-others delay-2000">
            <img
              src="/jyellow.png"
              alt="J Logo"
              className="w-[5.5rem] h-[6.5rem] lg:w-[4rem] lg:h-[5rem] object-contain shrink-0"
            />
            <div className="text-3xl lg:text-2xl font-bold leading-tight text-white whitespace-nowrap flex flex-col justify-center">
              <span>10+</span>
              <span>Projects</span>
            </div>
          </div>

          <div className="glass-card flex flex-col items-center justify-center gap-3 p-8 lg:p-6 w-fit min-w-[12rem] lg:min-w-[10rem] animate-others delay-2000">
            <div className="text-9xl lg:text-8xl font-black text-accent-yellow leading-none">
              4+
            </div>
            <div className="text-3xl lg:text-2xl font-bold leading-tight text-white text-center whitespace-nowrap">
              Years of<br />Designing
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-start gap-8 z-20 pointer-events-auto w-full lg:w-auto order-3 lg:order-2 lg:mb-8">
          <AnimatedTitle />

          <SpotlightButton className="self-end mr-8 lg:mr-0" />

          {/* Mobile Only: Combined Editorial Text */}
          <div className="text-3xl leading-relaxed font-medium text-center text-[#aaa] lg:hidden animate-others delay-2000 self-center w-full pr-6 mt-32 mb-20">
            Designed with purpose. Built by Jervys. Building ideas worth seeing, designs worth feeling, experiences worth remembering.
          </div>
        </div>

        {/* Right Side Cards */}
        <div className="flex flex-col gap-8 items-end w-fit pointer-events-auto self-end lg:self-auto order-2 lg:order-3 lg:-translate-y-7">
          <div className="glass-card w-fit p-8 lg:p-6 pr-14 lg:pr-12 animate-others delay-2000 lg:-translate-y-3">
            <ul className="flex flex-col gap-6 lg:gap-4 w-full list-none whitespace-nowrap">
              <li className="flex items-center gap-6 lg:gap-5 font-bold text-3xl lg:text-2xl text-white">
                <svg className="w-9 h-9 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,12 L20.66,7 A10,10 0 1,0 20.66,17 Z" />
                </svg>
                Creative
              </li>

              <li className="flex items-center gap-6 lg:gap-5 font-bold text-3xl lg:text-2xl text-white">
                <svg className="w-9 h-9 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="7" cy="7" r="5" />
                  <circle cx="17" cy="7" r="5" />
                  <circle cx="7" cy="17" r="5" />
                  <circle cx="17" cy="17" r="5" />
                </svg>
                Precise
              </li>

              <li className="flex items-center gap-6 lg:gap-5 font-bold text-3xl lg:text-2xl text-white">
                <svg className="w-9 h-9 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 8 v10 a2 2 0 0 0 2 2 h16 a2 2 0 0 0 2-2 v-10 a2 2 0 0 0-4 0 v6 h-4 v-8 a2 2 0 0 0-4 0 v8 h-4 v-6 a2 2 0 0 0-4 0 z" />
                </svg>
                Unique
              </li>

              <li className="flex items-center gap-6 lg:gap-5 font-bold text-3xl lg:text-2xl text-white">
                <svg className="w-9 h-9 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3 L3 9.5 L12 15 L21 9.5 Z" />
                  <path d="M12 11 L3 17.5 L12 23 L21 17.5 Z" />
                </svg>
                Builder
              </li>

              <li className="flex items-center gap-6 lg:gap-5 font-bold text-3xl lg:text-2xl text-white">
                <svg className="w-9 h-9 text-accent-yellow shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="7" cy="7" r="5" />
                  <circle cx="17" cy="7" r="5" />
                  <rect x="2" y="12" width="10" height="10" />
                  <circle cx="17" cy="17" r="5" />
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
