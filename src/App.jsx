import React from 'react';
import './index.css';

const SlotText = ({ text }) => (
  <span className="flex gap-[0.25em]">
    {text.split(' ').map((word, i) => (
      <span key={i} className="relative overflow-hidden flex flex-col h-[1.2em] leading-[1.2em] inline-flex">
        <span
          className="transition-transform duration-300 ease-in-out group-hover:-translate-y-full"
          style={{ transitionDelay: `${i * 50}ms` }}
        >{word}</span>
        <span
          className="absolute top-full transition-transform duration-300 ease-in-out group-hover:-translate-y-full"
          style={{ transitionDelay: `${i * 50}ms` }}
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

const AmbientGlow = () => {
  const [pos, setPos] = React.useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  React.useEffect(() => {
    const updatePos = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', updatePos);
    return () => window.removeEventListener('mousemove', updatePos);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-[80vw] h-[80vw] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_60%)] blur-[120px] pointer-events-none z-0 mix-blend-screen transition-transform duration-[1500ms] ease-out"
      style={{ transform: `translate(calc(${pos.x}px - 40vw), calc(${pos.y}px - 40vw))` }}
    />
  );
};

const DesktopNotice = () => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-[40px] lg:hidden animate-fade-in">
      <div className="glass-card relative flex flex-col items-start p-10 max-w-[420px] w-full animate-others delay-300">
        <div className="w-12 h-12 flex items-center justify-center bg-[#ffd500] rounded-full mb-8">
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
        </div>
        <h3 className="text-3xl font-black text-white leading-tight mb-4 tracking-tight">
          Viewport<br />Restricted.
        </h3>
        <p className="text-[#aaa] text-base leading-relaxed mb-10 font-medium">
          This experience relies on a wider viewport. For the intended layout and smooth animations, please expand your window or switch to a PC.
        </p>
        <div className="w-full bg-white/5 border border-white/10 text-[#aaa] font-bold py-4 rounded-lg text-center text-sm tracking-widest uppercase cursor-not-allowed select-none">
          Locked for Mobile
        </div>
      </div>
    </div>
  );
};

const NavLink = ({ href, text }) => (
  <a href={href} className="group text-white">
    <SlotText text={text} />
  </a>
);

function App() {
  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden bg-dark-bg">
      <CustomCursor />
      <AmbientGlow />
      <DesktopNotice />
      {/* Background Text & Nav Container (Locks them together) */}
      <div className="absolute top-[-5%] w-full flex flex-col items-center z-0 pointer-events-none">
        <h1 className="text-[35vw] font-black text-[#ffd500]/80 leading-none whitespace-nowrap select-none tracking-tighter ml-[-0.8vw] flex justify-center">
          {"JOHN".split("").map((char, index) => (
            <span key={index} className="inline-flex overflow-hidden pb-[2vw] mb-[-2vw] px-[1vw] mx-[-1vw]">
              <span className="animate-john inline-block leading-none" style={{ animationDelay: `${(3 - index) * 150}ms` }}>{char}</span>
            </span>
          ))}
        </h1>
        <header className="w-full flex justify-between px-16 text-sm font-bold tracking-wide mt-[-2vw] pointer-events-auto animate-others delay-1000">
          <nav className="flex items-center gap-6">
            <NavLink href="#home" text="HOME" />
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

      {/* Main Image */}
      <img src="/HeroImage2.png" alt="John" className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[97vh] z-10 object-contain pointer-events-none animate-others delay-1200"
        style={{ WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 60%, transparent 100%)', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 60%, transparent 100%)' }} />

      {/* Editorial Hero Details */}
      <div className="absolute bottom-14 left-14 z-20 text-base leading-relaxed font-medium text-[#aaa] animate-others delay-1400">
        <p>Design with intent.</p>
        <p>Built by John.</p>
      </div>

      <div className="absolute bottom-14 right-14 z-20 text-base leading-relaxed font-medium text-right text-[#aaa] animate-others delay-1400">
        <p>Bold ideas, brought to the web.</p>
        <p>Thoughtful design, built to move.</p>
        <p>Experiences that leave a mark.</p>
      </div>
      {/* Bottom Content Overlays */}
      <div className="relative z-20 flex justify-center gap-16 items-end px-16 pb-16 h-full w-full pointer-events-none animate-others delay-1600">

        {/* Left Side Cards */}
        <div className="flex flex-col gap-6 w-fit z-20 pointer-events-auto">
          <div className="glass-card flex items-center gap-6 p-6 w-[240px] -ml-12">
            <div className="text-7xl font-black text-accent-yellow">J</div>
            <div className="text-base leading-tight text-white whitespace-nowrap">
              <strong className="text-2xl">10+</strong><br />
              Projects Made
            </div>
          </div>

          <div className="glass-card flex flex-col items-center justify-center gap-2 p-6 w-fit min-w-[140px]">
            <div className="text-7xl font-black text-accent-yellow leading-none">4+</div>
            <div className="text-sm leading-tight text-white text-center whitespace-nowrap">
              Years of<br />experience
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-start gap-8 mb-8 z-20 pointer-events-auto">
          <h2 className="text-left text-white text-7xl font-black leading-[1.1] drop-shadow-[2px_2px_10px_rgba(0,0,0,0.8)]">
            Designed<br />To Be<br />Experienced.
          </h2>

        </div>

        {/* Right Side Cards */}
        <div className="flex flex-col gap-8 items-end w-fit pointer-events-auto">
          <div className="glass-card w-fit p-6 -mt-20">
            <ul className="flex flex-col gap-4 w-full list-none whitespace-nowrap">
              <li className="flex items-center gap-4 font-semibold text-base text-white">
                <svg className="w-6 h-6 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                Creative
              </li>
              <li className="flex items-center gap-4 font-semibold text-base text-white">
                <svg className="w-6 h-6 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                Reliable
              </li>
              <li className="flex items-center gap-4 font-semibold text-base text-white">
                <svg className="w-6 h-6 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                Unique
              </li>
              <li className="flex items-center gap-4 font-semibold text-base text-white">
                <svg className="w-6 h-6 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                Builder
              </li>
              <li className="flex items-center gap-4 font-semibold text-base text-white">
                <svg className="w-6 h-6 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Efficient
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
