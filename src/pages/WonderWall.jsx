import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const ROUTES = [
  { path: '/', label: 'Dashboard' },
  { path: '/goals', label: 'Minute Heatmap' },
  { path: '/clubs', label: 'Club Dominance' },
  { path: '/penalties', label: 'Shootout Graveyard' },
  { path: '/h2h', label: 'Head-to-Head' },
  { path: '/squads', label: 'Age vs Performance' },
  { path: '/referees', label: 'Referee Audit' },
  { path: '/groups', label: 'Group of Death' },
];

const ARG = {
  sky: '#74ACDF',
  skySoft: '#B8DCF3',
  skyPale: '#EAF6FF',
  navy: '#071D3A',
  ink: '#102033',
  muted: '#64748B',
  gold: '#B9902F',
  goldBright: '#D5AE4B',
  cream: '#FCFBF7',
  paper: '#FFFFFF',
  line: '#DDEAF4',
};

const commons = (fileName) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;

const PHOTO_SOURCES = {
  boyhood: commons('Messi Copa America 2007.jpg'),
  firstGoal: 'https://live-production.wcms.abc-cdn.net.au/7a36c158f100e7ce1f183bfa99dc3bb5?cropH=129&cropW=230&height=485&impolicy=wcms_crop_resize&width=862&xPos=0&yPos=0',
  southAfrica: commons('FIFA World Cup 2010 Argentina South Korea3.jpg'),
  maracana: 'https://www.worldpressphoto.org/getmedia/16d5df0f-887c-4c48-8e05-9d3e5e089fe2/2015-Bao-Tailiang-SP1?maxsidesize=1920&resizemode=force',
  crying: 'https://i.kym-cdn.com/photos/images/newsfeed/001/141/172/ed1.jpg',
  winningMoment: 'https://images.hindustantimes.com/img/2021/07/11/original/Messi_Lifted_in_Air_1625974697707.jpg',
  qatar: 'https://www.aljazeera.com/wp-content/uploads/2022/12/SSS10784_1.jpg?quality=80&resize=1170%2C780',
  qatarFallback: 'https://www.aljazeera.com/wp-content/uploads/2022/12/SSS18990.jpg?fit=1170%2C780&quality=80',
  encore: commons('Lionel Messi NYCFC Miami 24 Sep 2025-016.jpg'),
};

const CHAPTERS = [
  {
    year: '2005',
    title: 'The Boy from Rosario',
    sub: 'International Debut - vs Hungary',
    photo: PHOTO_SOURCES.boyhood,
    photoLabel: 'The prodigy arrives',
    photoPosition: 'center 38%',
    body: 'On August 17, 2005, an 18-year-old boy stepped onto a Budapest pitch for Argentina vs Hungary. Forty-seven seconds later, a red card sent him back into the tunnel. The beginning was fragile, almost unfair, but the shirt had found its future.',
    stats: [
      { label: 'Age at debut', value: '18' },
      { label: 'Seconds on pitch', value: '47' },
      { label: 'Goals scored', value: '0' },
      { label: 'Cards received', value: '1 RED' },
    ],
  },
  {
    year: '2006',
    title: 'Germany. First Blood.',
    sub: 'FIFA World Cup - Germany',
    photo: PHOTO_SOURCES.firstGoal,
    photoLabel: 'First goal celebration',
    photoFit: 'contain',
    photoPosition: 'center center',
    body: 'His first World Cup came with flashes of inevitability. He scored against Serbia and Montenegro, Argentina looked dangerous, and then Germany ended the run on penalties. The world had seen enough to know this story would continue.',
    stats: [
      { label: 'Goals', value: '1' },
      { label: 'Assists', value: '1' },
      { label: 'Matches', value: '3' },
      { label: 'Exit', value: 'QF' },
    ],
  },
  {
    year: '2010',
    title: "Maradona's Disciple",
    sub: 'FIFA World Cup - South Africa',
    photo: PHOTO_SOURCES.southAfrica,
    photoLabel: 'South Africa 2010',
    photoPosition: 'center 45%',
    body: 'Diego Maradona was coach, Messi was heir apparent, and Argentina swept through the group stage. Then Germany arrived again. The 4-0 quarter-final defeat made the dream feel distant, even as Messi was bending games around him.',
    stats: [
      { label: 'Goals', value: '0' },
      { label: 'Assists', value: '1' },
      { label: 'Matches', value: '5' },
      { label: 'Exit', value: 'QF' },
    ],
  },
  {
    year: '2014',
    title: 'So Close. So Cruel.',
    sub: 'FIFA World Cup - Brazil',
    photo: PHOTO_SOURCES.maracana,
    photoFallback: commons('Lionel Messi World Cup final - 140713-9163-jikatu .jpg'),
    photoLabel: 'The Final Game',
    photoFit: 'contain',
    photoPosition: 'center center',
    body: "He carried Argentina to the final, scored four times, and won the Golden Ball. Then Mario Gotze's extra-time volley froze the Maracana. Messi stood near the trophy, close enough to see it, too far to touch it.",
    stats: [
      { label: 'Goals', value: '4' },
      { label: 'Assists', value: '1' },
      { label: 'Matches', value: '7' },
      { label: 'Award', value: 'Golden Ball' },
    ],
  },
  {
    year: '2016',
    title: 'Retirement. Then Return.',
    sub: 'Copa America Centenario - USA',
    photo: PHOTO_SOURCES.crying,
    photoLabel: 'The tears of 2016',
    photoPosition: 'center 30%',
    body: 'Another final, another penalty heartbreak, and the sentence that stunned Argentina: "For me, the national team is over." The country asked him to stay. He came back, carrying the same shirt with a harder kind of grace.',
    stats: [
      { label: 'Finals lost', value: '3' },
      { label: 'Days retired', value: '72' },
      { label: 'Reason', value: 'Argentina' },
      { label: 'Trophies', value: '0' },
    ],
  },
  {
    year: '2021',
    title: 'First Blood. Finally.',
    sub: 'Copa America - Brazil',
    photo: PHOTO_SOURCES.winningMoment,
    photoLabel: 'Lifted by Argentina',
    photoFit: 'contain',
    photoPosition: 'center center',
    body: "July 10, 2021. Argentina beat Brazil 1-0 at the Maracana. Angel Di Maria scored, Messi collapsed, and sixteen years of noise fell away. The first senior Argentina trophy changed the air around everything.",
    stats: [
      { label: 'Goals', value: '4' },
      { label: 'Assists', value: '5' },
      { label: 'Award', value: 'Best Player' },
      { label: 'Wait', value: '16 years' },
    ],
  },
  {
    year: '2022',
    title: 'Destined.',
    sub: 'FIFA World Cup - Qatar',
    photo: PHOTO_SOURCES.qatar,
    photoFallback: PHOTO_SOURCES.qatarFallback,
    photoLabel: 'Trophy lifted',
    photoFit: 'contain',
    photoPosition: 'center center',
    body: 'Seven goals, three assists, seven matches, and a final that felt written by chaos. France forced it to 3-3, Argentina held its nerve in the shootout, and Lionel Messi finally became World Champion.',
    stats: [
      { label: 'Goals', value: '7' },
      { label: 'Assists', value: '3' },
      { label: 'Matches', value: '7' },
      { label: 'Award', value: 'Golden Ball' },
    ],
    highlight: true,
  },
  {
    year: '2026',
    title: 'One More Time.',
    sub: 'FIFA World Cup - USA, Canada, Mexico',
    photo: PHOTO_SOURCES.encore,
    photoLabel: 'Miami era',
    photoPosition: 'center 16%',
    body: 'He will turn 39 during the tournament. The odds say no, but the shirt says something else. Defending champions, five World Cups behind him, and one last dance still glowing on the horizon.',
    stats: [
      { label: 'Age in June 2026', value: '38' },
      { label: 'WC career goals', value: '13' },
      { label: 'WC assists', value: '8' },
      { label: 'Status', value: 'LEGEND' },
    ],
    isFuture: true,
  },
];

function useCounter(target, duration = 1500, started = false) {
  const isNumeric = !Number.isNaN(parseFloat(target));
  const [value, setValue] = useState(isNumeric ? 0 : target);

  useEffect(() => {
    if (!started) return;
    if (!isNumeric) return;
    const num = parseFloat(target);

    let start = null;
    let frame = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * num));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [started, target, duration, isNumeric]);

  return isNumeric ? value : target;
}

function StatPill({ label, value, started }) {
  const displayed = useCounter(value, 1300, started);

  return (
    <div className="rounded-xl border px-4 py-3 text-center"
      style={{
        borderColor: 'rgba(116,172,223,0.35)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.82), rgba(234,246,255,0.62))',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)',
      }}>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 700, color: ARG.navy, lineHeight: 1 }}>{displayed}</span>
      <span className="block mt-1 uppercase" style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.52rem', letterSpacing: '0.16em', color: ARG.muted }}>{label}</span>
    </div>
  );
}

function EraPhoto({ chapter, alignRight }) {
  const isContained = chapter.photoFit === 'contain';

  return (
    <figure
      className="relative overflow-hidden rounded-2xl border min-h-[280px] md:min-h-[390px]"
      style={{
        borderColor: chapter.highlight ? 'rgba(185,144,47,0.48)' : 'rgba(116,172,223,0.36)',
        boxShadow: chapter.highlight
          ? '0 26px 60px rgba(185,144,47,0.22), 0 10px 30px rgba(7,29,58,0.12)'
          : '0 22px 50px rgba(7,29,58,0.12)',
        transform: alignRight ? 'rotate(1deg)' : 'rotate(-1deg)',
        background: ARG.paper,
      }}
    >
      {isContained && (
        <img
          src={chapter.photo}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          style={{
            filter: 'blur(22px) saturate(0.95)',
            opacity: 0.42,
            transform: 'scale(1.12)',
            objectPosition: chapter.photoPosition || 'center center',
          }}
        />
      )}
      <img
        src={chapter.photo}
        alt={`${chapter.year} Lionel Messi era`}
        className="absolute inset-0 h-full w-full"
        loading="lazy"
        onError={(event) => {
          if (chapter.photoFallback && event.currentTarget.src !== chapter.photoFallback) {
            event.currentTarget.src = chapter.photoFallback;
          }
        }}
        style={{
          objectFit: chapter.photoFit || 'cover',
          objectPosition: chapter.photoPosition || 'center center',
          padding: isContained ? '1.1rem' : 0,
        }}
      />
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(7,29,58,0.02), transparent 36%, rgba(7,29,58,0.62))',
        }}
      />
      <figcaption
        className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 px-4 py-4"
        style={{ color: ARG.paper }}
      >
        <span className="uppercase" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.18em', fontSize: '0.55rem' }}>
          {chapter.photoLabel}
        </span>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', lineHeight: 1 }}>
          {chapter.year}
        </span>
      </figcaption>
    </figure>
  );
}

function ChapterCard({ chapter, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const flip = index % 2 === 1;

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative mb-16 md:mb-24"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0)' : 'translate3d(0,34px,0)',
        transition: `opacity 800ms cubic-bezier(.22,1,.36,1) ${Math.min(index * 70, 280)}ms, transform 800ms cubic-bezier(.22,1,.36,1) ${Math.min(index * 70, 280)}ms`,
      }}
    >
      <div className={`grid items-center gap-7 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] ${flip ? 'md:[&>*:first-child]:order-2' : ''}`}>
        <EraPhoto chapter={chapter} alignRight={flip} />

        <article
          className="relative overflow-hidden rounded-3xl border p-6 md:p-8"
          style={{
            background: chapter.highlight
              ? 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,248,222,0.94))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(234,246,255,0.82))',
            borderColor: chapter.highlight ? 'rgba(185,144,47,0.38)' : 'rgba(116,172,223,0.30)',
            boxShadow: '0 24px 70px rgba(7,29,58,0.10)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-70"
            style={{
              backgroundImage: `
                repeating-linear-gradient(90deg, rgba(116,172,223,0.16) 0 1px, transparent 1px 22px),
                linear-gradient(120deg, rgba(255,255,255,0.80), transparent 46%, rgba(185,144,47,0.08))
              `,
              mixBlendMode: 'multiply',
            }}
          />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className="rounded-full border px-3 py-1 uppercase"
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  borderColor: chapter.highlight ? 'rgba(185,144,47,0.5)' : 'rgba(116,172,223,0.48)',
                  background: chapter.highlight ? 'rgba(185,144,47,0.11)' : 'rgba(116,172,223,0.14)',
                  color: chapter.highlight ? ARG.gold : ARG.navy,
                }}
              >
                {chapter.year}
              </span>
              <span className="uppercase" style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.68rem', letterSpacing: '0.14em', color: ARG.muted }}>
                {chapter.sub}
              </span>
              {chapter.isFuture && (
                <span className="rounded-full border px-2 py-1 uppercase" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.52rem', letterSpacing: '0.15em', color: ARG.gold, borderColor: 'rgba(185,144,47,0.42)' }}>
                  Incoming
                </span>
              )}
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(2rem,4vw,3.05rem)',
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '0.01em',
                color: chapter.highlight ? ARG.gold : ARG.navy,
                marginBottom: '1rem',
              }}
            >
              {chapter.title}
            </h2>

            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.94rem', lineHeight: 1.8, color: ARG.ink, marginBottom: '1.5rem' }}>
              {chapter.body}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {chapter.stats.map((stat) => (
                <StatPill key={stat.label} label={stat.label} value={stat.value} started={visible} />
              ))}
            </div>

            {chapter.highlight && (
              <div className="mt-6 rounded-2xl border px-5 py-4"
                style={{
                  borderColor: 'rgba(185,144,47,0.38)',
                  background: 'linear-gradient(135deg, rgba(185,144,47,0.13), rgba(255,255,255,0.66))',
                }}
              >
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.72rem', letterSpacing: '0.22em', color: ARG.gold, textTransform: 'uppercase' }}>
                  World Champion
                </div>
                <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.76rem', letterSpacing: '0.06em', color: ARG.muted, marginTop: '0.35rem' }}>
                  December 18, 2022 - Lusail Stadium - Qatar
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function JerseyReveal({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: ARG.cream }}
    >
      <div className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(116,172,223,0.48) 0 15%, rgba(255,255,255,0.86) 15% 30%, rgba(116,172,223,0.48) 30% 45%, rgba(255,255,255,0.86) 45% 60%, rgba(116,172,223,0.48) 60% 75%, rgba(255,255,255,0.86) 75% 100%),
            repeating-linear-gradient(0deg, rgba(7,29,58,0.035) 0 1px, transparent 1px 5px)
          `,
          animation: 'jerseyGlide 1200ms cubic-bezier(.22,1,.36,1) both',
        }}
      />
      <div
        className="relative rounded-full border px-7 py-4 text-center"
        style={{
          borderColor: 'rgba(185,144,47,0.42)',
          background: 'rgba(255,255,255,0.72)',
          boxShadow: '0 24px 80px rgba(7,29,58,0.15)',
          backdropFilter: 'blur(12px)',
          animation: 'crestSettle 900ms cubic-bezier(.22,1,.36,1) both',
        }}
      >
        <div style={{ fontFamily: "'Cinzel', serif", color: ARG.gold, letterSpacing: '0.3em', fontSize: '0.62rem', textTransform: 'uppercase' }}>
          Argentina
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", color: ARG.navy, fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
          10
        </div>
      </div>
    </div>
  );
}

function BackNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed left-5 top-5 z-[500]">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full border font-bold transition-all duration-300"
        style={{
          background: open ? ARG.navy : 'rgba(255,255,255,0.78)',
          borderColor: open ? ARG.navy : 'rgba(116,172,223,0.42)',
          color: open ? ARG.paper : ARG.navy,
          boxShadow: '0 12px 35px rgba(7,29,58,0.14)',
          backdropFilter: 'blur(14px)',
        }}
        title={open ? 'Close menu' : 'Navigate back'}
      >
        {open ? 'x' : '☰'}
      </button>

      <div
        className="mt-2 origin-top-left overflow-hidden rounded-2xl border transition-all duration-300"
        style={{
          maxHeight: open ? 420 : 0,
          opacity: open ? 1 : 0,
          transform: open ? 'scaleY(1)' : 'scaleY(0.92)',
          background: 'rgba(255,255,255,0.91)',
          borderColor: open ? 'rgba(116,172,223,0.32)' : 'transparent',
          backdropFilter: 'blur(20px)',
          boxShadow: open ? '0 20px 60px rgba(7,29,58,0.16)' : 'none',
          minWidth: 210,
        }}
      >
        <div className="border-b px-4 py-3" style={{ borderColor: ARG.line }}>
          <div className="uppercase" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.58rem', letterSpacing: '0.18em', color: ARG.gold }}>
            Navigate to
          </div>
        </div>
        {ROUTES.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm font-bold transition-colors hover:bg-sky-50"
            style={{ color: ARG.ink }}
          >
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export const WonderWall = () => {
  const [ready, setReady] = useState(false);
  const [showReveal, setShowReveal] = useState(true);
  const doneRef = useRef(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.id = 'messi-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Cinzel:wght@400;600;700;900&family=Raleway:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
    return () => document.getElementById('messi-fonts')?.remove();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDone = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setShowReveal(false);
    setReady(true);
  };

  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes jerseyGlide {
          0% { transform: scale(1.12) translateY(24px); filter: blur(9px); opacity: 0; }
          42% { opacity: 1; filter: blur(0); }
          100% { transform: scale(1) translateY(0); opacity: 0; }
        }
        @keyframes crestSettle {
          0% { transform: translateY(18px) scale(.94); opacity: 0; }
          45% { opacity: 1; }
          100% { transform: translateY(-10px) scale(1); opacity: 0; }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translate3d(0,26px,0); }
          100% { opacity: 1; transform: translate3d(0,0,0); }
        }
        @keyframes softDrift {
          0%,100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,-8px,0); }
        }
        @keyframes goldSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          20%,70% { opacity: .9; }
          100% { transform: translateX(120%); opacity: 0; }
        }
      `}</style>

      {showReveal && <JerseyReveal onDone={handleDone} />}
      <BackNav />

      <main
        className="fixed inset-0 overflow-y-auto"
        style={{
          zIndex: 40,
          opacity: ready ? 1 : 0,
          transition: 'opacity 900ms cubic-bezier(.22,1,.36,1)',
          background: ARG.cream,
          color: ARG.ink,
        }}
      >
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(116,172,223,0.28) 0 13%, rgba(255,255,255,0.80) 13% 27%, rgba(116,172,223,0.25) 27% 40%, rgba(255,255,255,0.82) 40% 56%, rgba(116,172,223,0.24) 56% 70%, rgba(255,255,255,0.82) 70% 84%, rgba(116,172,223,0.22) 84% 100%),
              repeating-linear-gradient(0deg, rgba(7,29,58,0.026) 0 1px, transparent 1px 5px),
              radial-gradient(circle at 76% 8%, rgba(185,144,47,0.18), transparent 24%),
              radial-gradient(circle at 10% 24%, rgba(116,172,223,0.22), transparent 26%)
            `,
          }}
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-28 pt-24 md:px-8">
          <header
            className="relative mb-20 overflow-hidden rounded-[2rem] border px-6 py-14 text-center md:px-12 md:py-20"
            style={{
              animation: ready ? 'fadeUp 900ms cubic-bezier(.22,1,.36,1) 120ms both' : 'none',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.88), rgba(234,246,255,0.72))',
              borderColor: 'rgba(116,172,223,0.36)',
              boxShadow: '0 34px 90px rgba(7,29,58,0.12)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-1 overflow-hidden">
              <div className="h-full w-1/2" style={{ background: `linear-gradient(90deg, transparent, ${ARG.goldBright}, transparent)`, animation: 'goldSweep 3600ms ease-in-out infinite' }} />
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-80"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(90deg, transparent 0 24px, rgba(116,172,223,0.16) 24px 25px),
                  linear-gradient(120deg, rgba(255,255,255,0.76), transparent 42%, rgba(185,144,47,0.08))
                `,
                mixBlendMode: 'multiply',
              }}
            />

            <div className="relative z-10">
              <div className="mb-7 inline-flex items-center gap-3 rounded-full border px-4 py-2"
                style={{ borderColor: 'rgba(185,144,47,0.34)', background: 'rgba(255,255,255,0.58)' }}>
                <span className="h-2 w-2 rounded-full" style={{ background: ARG.gold }} />
                <span className="uppercase" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.58rem', letterSpacing: '0.24em', color: ARG.gold }}>
                  World Champion Chronicle
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(3.5rem,9vw,8rem)',
                  fontWeight: 700,
                  lineHeight: 0.9,
                  letterSpacing: '0.02em',
                  color: ARG.navy,
                  marginBottom: '1rem',
                }}
              >
                Lionel Messi
              </h1>
              <p className="mx-auto max-w-2xl"
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: '0.98rem',
                  lineHeight: 1.8,
                  color: ARG.ink,
                }}
              >
                A light Albiceleste wall of eras, heartbreaks, returns, and the world-title glow that turned the number 10 into a national heirloom.
              </p>

              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { v: '26', l: 'WC Matches' },
                  { v: '13', l: 'WC Goals' },
                  { v: '8', l: 'WC Assists' },
                  { v: '5', l: 'WCs Played' },
                  { v: '1', l: 'World Title' },
                  { v: '8', l: "Ballon d'Or" },
                ].map((stat) => (
                  <div key={stat.l} className="rounded-2xl border px-4 py-4"
                    style={{
                      background: 'rgba(255,255,255,0.62)',
                      borderColor: 'rgba(116,172,223,0.28)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.92)',
                    }}
                  >
                    <span className="block" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', fontWeight: 700, color: ARG.navy, lineHeight: 1 }}>{stat.v}</span>
                    <span className="mt-2 block uppercase" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.48rem', letterSpacing: '0.17em', color: ARG.muted }}>{stat.l}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12 inline-flex flex-col items-center gap-2 uppercase"
                style={{ color: ARG.muted, fontFamily: "'Raleway', sans-serif", fontSize: '0.66rem', letterSpacing: '0.18em', animation: 'softDrift 3200ms ease-in-out infinite' }}>
                <span>Scroll the eras</span>
                <span style={{ color: ARG.gold }}>v</span>
              </div>
            </div>
          </header>

          <div className="mb-14 flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${ARG.sky}, transparent)` }} />
            <div className="uppercase" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.62rem', letterSpacing: '0.35em', color: ARG.gold }}>
              The Chronicle
            </div>
            <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${ARG.sky}, transparent)` }} />
          </div>

          {CHAPTERS.map((chapter, index) => (
            <ChapterCard key={chapter.year} chapter={chapter} index={index} />
          ))}

          <footer className="mt-6 px-5 text-center md:px-10">
            <div className="mb-14 h-px" style={{ background: `linear-gradient(to right, transparent, ${ARG.gold}, transparent)` }} />
            <blockquote
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(1.8rem,4vw,3rem)',
                fontStyle: 'italic',
                lineHeight: 1.35,
                color: ARG.navy,
              }}
            >
              &ldquo;I would rather win a World Cup with Argentina than ten Ballon d&rsquo;Ors.&rdquo;
            </blockquote>
            <div className="mt-5 uppercase" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.62rem', letterSpacing: '0.28em', color: ARG.gold }}>
              Lionel Messi, 2014
            </div>
            <div className="mt-3" style={{ fontFamily: "'Raleway', sans-serif", fontSize: '0.82rem', color: ARG.muted }}>
              He won it on December 18, 2022.
            </div>
            <div className="mt-16 uppercase" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.5rem', letterSpacing: '0.35em', color: 'rgba(16,32,51,0.34)' }}>
              FIFA World Cup Analytics - Messi Chronicle
            </div>
          </footer>
        </div>
      </main>
    </>
  );
};
