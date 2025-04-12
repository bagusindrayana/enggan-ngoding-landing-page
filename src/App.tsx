import React, { useState, useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';
import './App.css'
import NeumorphicWaveBanner from './components/NeumorphicWaveBanner';

import Rive, { useRive } from '@rive-app/react-canvas';

const DEFAULT_EMOJIS = ['😀', '🚀', '🎉', '💡', '💖', '✨', '🌟', '🎈', '🍕', '🍦', '😎', '🥳'];
const NUM_EMOJIS = 30;

const Emoji = React.memo(({ id, text, x, y, rotation, opacity }: { id: number, text: string, x: number, y: number, rotation: number, opacity: number }) => {
  return (
    <span
      key={id} // Key is important for list rendering
      className="emoji"
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
        opacity: opacity,
        position: 'absolute',
        fontSize: '2rem',
        userSelect: 'none',
        zIndex: 1,
        willChange: 'transform, opacity', // Optimize animation
      }}
    >
      {text}
    </span>
  );
});

function App() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Ref to the banner container div to get its dimensions
  const bannerRef = useRef<HTMLDivElement | null>(null);
  // State to hold the array of emoji objects
  const [emojis, setEmojis] = useState<any>([]);
  // Ref to store the animation frame request ID for cancellation
  const animationFrameId = useRef<number | null>(null);

  const [riveLoading, setRiveLoading] = useState(true);

  const fbPosts = [
    { img: '/post-1.jpg', name: 'Lycty Cuteness', msg: '*1 rasanya aneh' },
    { img: '/post-2.jpg', name: 'Rizky', msg: 'Misi bang, minta rekomendasi, saya sekarang lagi belajar PHP/laravel' },
    { img: '/post-3.jpg', name: 'Cooler KagChi', msg: '100 Alasan kenapa kalian harus pake PHP' },
    { img: '/post-4.jpg', name: 'Yudha Saputra', msg: 'kenapa member sini pada musuhin programmer PHP dah.' },
    { img: '/post-5.jpg', name: 'Rudi Salim', msg: 'User PHP belike:' },
    { img: '/post-6.jpg', name: 'Naufal Azmi', msg: 'Lencana limited edisi 1000 member.' },
    { img: '/post-7.jpg', name: 'Akhdann', msg: 'PHP, kamu seperti seorang diktator yang selalu memerintah, tapi tidak pernah mendengarkan.' }
  ];

  const { rive, RiveComponent } = useRive({
    src: './test_logo_imphnen.riv',
    animations: 'Timeline 1',
    autoplay: true,
    onLoad: () => {
      setRiveLoading(false);
    },
  });

  useEffect(() => {
    if (!riveLoading) {
      setTimeout(() => {
        if (rive) {
          rive.pause();
        }
        const loading = document.getElementById('loading') as HTMLDivElement;
        if (loading) {

          anime({
            targets: loading,
            opacity: [1, 0],
            duration: 500,
            easing: 'easeInOutQuad',
            complete: () => {
              loading.style.display = 'none'; // Hide the loading screen
            }
          });

        }
      }, 10000);
    }
  }, [riveLoading]);


  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const initializeEmojis = useCallback(() => {
    if (!bannerRef.current) return; // Exit if banner ref is not available yet

    const containerRect = bannerRef.current.getBoundingClientRect();
    const newEmojis = [];

    for (let i = 0; i < NUM_EMOJIS; i++) {
      newEmojis.push({
        id: i, // Simple ID for key prop
        text: DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)],
        x: Math.random() * containerRect.width,
        y: Math.random() * containerRect.height,
        vx: (Math.random() - 0.5) * 0.5, // Slow horizontal velocity
        vy: (Math.random() - 0.5) * 0.5, // Slow vertical velocity
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.2, // Slow rotation
        opacity: 0.1 + Math.random() * 0.5, // Random initial opacity
      });
    }
    setEmojis(newEmojis); // Update state with the new emojis
  }, []); //

  // --- Animation Loop ---
  const animateEmojis = useCallback(() => {
    if (!bannerRef.current) return; // Exit if banner ref is not available

    const containerRect = bannerRef.current.getBoundingClientRect();
    const bannerWidth = containerRect.width;
    const bannerHeight = containerRect.height;

    setEmojis((prevEmojis: any) =>
      prevEmojis.map((emoji: any) => {
        let { x, y, vx, vy, rotation, rotationSpeed } = emoji;

        // Update position and rotation
        x += vx;
        y += vy;
        rotation += rotationSpeed;

        // Approximate emoji dimensions (can be refined if needed)
        const emojiSize = 32; // font-size * approx width factor (adjust if font-size changes)

        // Bounce off edges
        if (x < 0 || x > bannerWidth - emojiSize) {
          vx *= -1;
          x = Math.max(0, Math.min(x, bannerWidth - emojiSize)); // Clamp position
        }
        if (y < 0 || y > bannerHeight - emojiSize) {
          vy *= -1;
          y = Math.max(0, Math.min(y, bannerHeight - emojiSize)); // Clamp position
        }

        return {
          ...emoji, // Keep other properties (id, text, opacity)
          x,
          y,
          vx,
          vy,
          rotation,
        };
      })
    );

    // Request the next animation frame
    animationFrameId.current = requestAnimationFrame(animateEmojis);
  }, []); //


  // --- Effect for Initialization and Resize Handling ---
  useEffect(() => {
    // Initialize emojis when component mounts
    initializeEmojis();

    // Debounced resize handler
    let resizeTimeout = 0;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        initializeEmojis(); // Re-initialize emojis on resize
      }, 250); // Debounce resize event
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function: remove resize listener when component unmounts
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [initializeEmojis]);

  // --- Effect for Starting and Stopping Animation ---
  useEffect(() => {
    // Start animation only if there are emojis initialized
    if (emojis.length > 0) {
      animationFrameId.current = requestAnimationFrame(animateEmojis);
    }

    // Cleanup function: cancel animation frame when component unmounts
    // or when emojis array becomes empty (though it shouldn't in this logic)
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [emojis, animateEmojis]);

  useEffect(() => {


    // --- Navbar Toggle ---
    const mobileMenu = document.getElementById('mobile-menu') as HTMLDivElement;;
    const mobileMenuLinks = mobileMenu.querySelectorAll('a'); // Get all links in mobile menu



    // --- Close Mobile Menu When Link Is Clicked ---
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        setIsMobileMenuOpen(false);
      });
    });

    // Hero Text Animation
    anime({
      targets: '.hero-text-line',
      translateY: [30, 0],
      opacity: [0, 1],
      delay: anime.stagger(200, { start: 300 }), // Stagger the lines
      duration: 800,
      easing: 'easeOutExpo'
    });

    // Section Title Animation on Scroll
    const observerOptions = {
      root: null, // relative to document viewport
      rootMargin: '0px',
      threshold: 0.1 // trigger when 10% of the target is visible
    };

    const observerCallback = (entries: any, observer: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          anime({
            targets: entry.target,
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutCubic'
          });
          observer.unobserve(entry.target); // Animate only once
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    document.querySelectorAll('.section-title').forEach(title => {
      observer.observe(title);
    });




  }, []);

  return (
    <>
      <div className='fixed top-0 left-0 right-0 bottom-0 w-full  bg-[#e0e5ec] z-50 overflow-hidden' id='loading'>
        <div className='fixed top-0 left-0 right-0 bottom-0 m-auto' style={{
          maxHeight: '600px',
          maxWidth: '600px',
          width: '100%',
          height: '100%',
        }}>

          <RiveComponent />
        </div>
        <p className='fixed left-0 right-0 bottom-0 m-auto text-center'>Sabar ya loadingnya lama, webnya lagi enggan tampil...</p>
      </div>
      <header className="py-4 px-6 md:px-12">
        <nav className="container mx-auto flex justify-between items-center">
          <div >
            <img src="/imphnen simple.png" alt="" width={100} />
          </div>

          <div className="hidden md:flex space-x-4">
            <a href="#about" className="neumorphic-btn px-4 py-2 text-sm">About</a>
            <a href="#activity" className="neumorphic-btn px-4 py-2 text-sm">Activity</a>
            <a href="#project" className="neumorphic-btn px-4 py-2 text-sm">Project</a>
            <a href="#learn" className="neumorphic-btn px-4 py-2 text-sm">Learn</a>
            <a href="#contact" className="neumorphic-btn px-4 py-2 text-sm">Contact</a>
          </div>

          <div className="md:hidden">
            <button onClick={toggleMenu} className="neumorphic-btn !p-2 focus:outline-none" aria-label="Toggle menu"> {/* Added ID and adjusted padding */}
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </nav>

        <div id="mobile-menu" className={`mt-4 neumorphic-flat p-4 space-y-2 ${isMobileMenuOpen ? 'menu-open' : ''}`}>
          <a href="#about" className="block neumorphic-btn w-full py-2">About</a>
          <a href="#activity" className="block neumorphic-btn w-full py-2">Activity</a>
          <a href="#project" className="block neumorphic-btn w-full py-2">Project</a>
          <a href="#learn" className="block neumorphic-btn w-full py-2">Learn</a>
          <a href="#contact" className="block neumorphic-btn w-full py-2">Contact</a>
        </div>
      </header>

      <main>
        <section id="hero" className="h-[calc(100vh-100px)] overflow-hidden flex items-center justify-center text-center px-4" style={{ background: 'linear-gradient(135deg, #e0e5ec 0%, #d1d9e6 100%)' }}>
          <NeumorphicWaveBanner />
          <div id="banner" className="neumorphism-banner" ref={bannerRef}>
            <div className="absolute inset-0 z-1">
              {/* Render each emoji using the Emoji component */}
              {emojis.map((emoji: any) => (
                <Emoji
                  key={emoji.id}
                  id={emoji.id}
                  text={emoji.text}
                  x={emoji.x}
                  y={emoji.y}
                  rotation={emoji.rotation}
                  opacity={emoji.opacity}
                />
              ))}
            </div>

            <div className="neumorphism-content">
              <h1 className="text-4xl md:text-6xl mb-4 text-[2.5rem] md:text-[3.5rem] font-bold text-[#4a5568] [text-shadow:1px_1px_2px_#a3b1c6,_-1px_-1px_2px_#ffffff]">
                <span className="hero-text-line inline-block text-4xl md:text-6xl">Ingin Jadi Programmer Handal?</span><br />
                <span className="hero-text-line inline-block text-4xl md:text-6xl">(Tapi Males Ngoding?)</span>
              </h1>
              {/* <p className="hero-text-line text-lg md:text-xl text-gray-600 mb-8">
                Selamat datang di IMPHNEN. Komunitas *unik* bagi calon programmer hebat yang... yah, kita semua tahu lah.
              </p> */}
              <a href="#about" className="hero-text-line inline-block neumorphic-btn px-8 py-3 text-lg">
                Cari Tahu Lebih Lanjut <i className="fas fa-arrow-down ml-2"></i>
              </a>
            </div>
          </div>

        </section>

        <section id="about" className="py-28 px-6 md:px-12 space-y-12">

          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="section-title text-3xl md:text-4xl font-bold mb-10 text-gray-700">Tentang Kami</h2>

            <div className="neumorphic-card">
              {/* <img src="/imphnen simple.png" alt="" width={200} className='mx-auto' /> */}

              <div className='relative' style={{ width: '150px', height: '150px', margin: '0 auto' }}>
                <div className='absolute' style={{
                  maxHeight: '600px',
                  maxWidth: '600px',
                  width: '100%',
                  height: '100%', margin: '0 auto', top: '-25px'
                }}>
                  <Rive
                    src="/test_logo_imphnen.riv"
                    animations="Timeline 2"

                  />
                </div>
              </div>

              <p className="text-lg mb-4 text-gray-600 leading-relaxed">
                IMPHNEN (Ingin Menjadi Programmer Handal Namun Enggan Ngoding) adalah sebuah paradoks, sebuah misteri, sebuah... tempat nongkrong digital. Kami adalah kumpulan individu berbakat yang mengapresiasi keindahan kode, logika algoritma, dan potensi tak terbatas teknologi... dari kejauhan.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Misi kami? Mungkin suatu hari nanti kami akan menulis kode. Untuk saat ini, kami fokus pada diskusi filosofis tentang tab vs spasi, memilih tema VS Code terbaik, dan mengeluh tentang bug yang bahkan belum kami tulis. Bergabunglah jika Anda bercita-cita tinggi tapi... mager.
              </p>
            </div>
          </div>

          <div className="container mx-auto max-w-4xl text-center grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="neumorphism-card p-6 w-full text-center">
              <div className="flex justify-center mb-4">
                <div className="neumorphism-icon-bg rounded-full p-4">
                  {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg> */}
                  <i className="fab fa-facebook text-2xl text-blue-600"></i>
                </div>

              </div>

              <div className="text-3xl font-bold text-gray-800 mb-1">
                170,000
              </div>

              <div className="text-sm font-medium text-gray-500">
                Facebook
              </div>
            </div>

            <div className="neumorphism-card p-6 w-full text-center">
              <div className="flex justify-center mb-4">
                <div className="neumorphism-icon-bg rounded-full p-4">
                  {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg> */}
                  <i className="fab fa-discord text-2xl text-indigo-600"></i>
                </div>
              </div>

              <div className="text-3xl font-bold text-gray-800 mb-1">
                999
              </div>

              <div className="text-sm font-medium text-gray-500">
                Discord
              </div>
            </div>
            <div className="neumorphism-card p-6 w-full text-center">
              <div className="flex justify-center mb-4">
                <div className="neumorphism-icon-bg rounded-full p-4">
                  {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg> */}
                  <i className="fab fa-youtube text-2xl text-red-600"></i>
                </div>
              </div>

              <div className="text-3xl font-bold text-gray-800 mb-1">
                999
              </div>

              <div className="text-sm font-medium text-gray-500">
                Youtube
              </div>
            </div>

          </div>

        </section>

        <section id="activity" className="py-20 px-6 md:px-12 bg-gradient-to-br from-[#d1d9e6] to-[#e0e5ec]">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="section-title text-3xl md:text-4xl font-bold mb-10 text-gray-700">Aktivitas Komunitas</h2>
            <div className="neumorphic-card md:flex items-center gap-8">
              <div className="md:w-1/2 text-left mb-8 md:mb-0">
                <h3 className="text-2xl font-semibold mb-4 text-gray-700">Apa yang Kami Lakukan?</h3>
                <p className="text-lg mb-6 text-gray-600 leading-relaxed">
                  Pertanyaan bagus! Aktivitas utama kami meliputi:
                </p>

                <div className="space-y-4 text-left mb-8">

                  <div className="neumorphic-inset flex items-center space-x-4">
                    <i className="fas fa-gear text-2xl text-gray-600"></i>
                    <span className="text-gray-700">Membahas framework JavaScript terbaru (tanpa pernah menginstalnya).</span>
                  </div>
                  <div className="neumorphic-inset flex items-center space-x-4">
                    <i className="fas fa-laptop text-2xl text-blue-600"></i>
                    <span className="text-gray-700">Mengagumi setup 'Work From Home' orang lain.</span>
                  </div>
                  <div className="neumorphic-inset flex items-center space-x-4">
                    <i className="fab fa-facebook text-2xl text-blue-600"></i>
                    <span className="text-gray-700">Kegiatan rutin? Ya, lanjut scroll Facebook.</span>
                  </div>
                  <div className="neumorphic-inset flex items-center space-x-4">
                    <i className="fa-solid fa-dollar-sign text-2xl text-purple-600"></i>
                    <span className="text-gray-700">Menghina PHP.</span>
                  </div>
                </div>

                <p className="text-lg text-gray-600 italic">"Kami sangat produktif... dalam merencanakan untuk menjadi produktif."</p>
              </div>
              <div className="md:w-1/2">
                <div className="phone-container">
                  <div className="phone-mockup">
                    <div className="phone-screen">
                      <div className="scroll-content bg-white text-left" >
                        {fbPosts.map((post: any) => (
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center mb-3">
                              <img className="h-10 w-10 rounded-full mr-3 object-cover"
                                src="https://placehold.co/40x40/E2E8F0/4A5568?text=User"
                                alt="User profile picture" />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{post.name}</p>
                                <p className="text-xs text-gray-500">2 hours ago</p>
                              </div>
                              <div className="ml-auto">
                                <i className="fas fa-ellipsis-h text-gray-500"></i>
                              </div>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm text-gray-800 mb-3 ">
                                {post.msg}
                              </p>
                              <img className="w-full rounded-lg object-cover"
                                src={post.img} />
                            </div>

                            <div className="flex justify-around border-t border-gray-200 pt-3 text-sm md:text-base">
                              <button className="flex items-center text-gray-600 hover:text-blue-600 text-sm">
                                <i className="far fa-thumbs-up mr-1"></i> Like
                              </button>
                              <button className="flex items-center text-gray-600 hover:text-blue-600 text-sm">
                                <i className="far fa-comment-alt mr-1"></i> Comment
                              </button>
                              <button className="flex items-center text-gray-600 hover:text-blue-600 text-sm">
                                <i className="far fa-share-square mr-1"></i> Share
                              </button>
                            </div>
                          </div>
                        ))}



                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section id="project" className="py-20 px-6 md:px-12">
          <div className="container mx-auto max-w-5xl text-center">
            <h2 className="section-title text-3xl md:text-4xl font-bold mb-12 text-gray-700">Proyek (Impian) Kami</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="neumorphic-card text-left">
                <div className="w-full h-32 neumorphic-inset mb-4 flex items-center justify-center">
                  <i className="fas fa-lightbulb text-4xl text-yellow-500"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-700">"CodeLater" To-Do App</h3>
                <p className="text-gray-600">Aplikasi to-do list canggih untuk mencatat semua ide coding... yang akan dikerjakan nanti. Mungkin.</p>
              </div>
              <div className="neumorphic-card text-left">
                <div className="w-full h-32 neumorphic-inset mb-4 flex items-center justify-center">
                  <i className="fas fa-coffee text-4xl text-amber-700"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-700">"ProcrastiNation" Social Network</h3>
                <p className="text-gray-600">Platform sosial khusus untuk berbagi alasan kenapa kita belum mulai ngoding hari ini.</p>
              </div>
              <div className="neumorphic-card text-left">
                <div className="w-full h-32 neumorphic-inset mb-4 flex items-center justify-center">
                  <i className="fas fa-bed text-4xl text-indigo-500"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-700">AI Code Generator (Idea Only)</h3>
                <p className="text-gray-600">Konsep revolusioner: AI yang bisa menulis kode berdasarkan niat baik dan secangkir kopi.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="learn" className="py-20 px-6 md:px-12 bg-gradient-to-br from-[#d1d9e6] to-[#e0e5ec]">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="section-title text-3xl md:text-4xl font-bold mb-10 text-gray-700">Sumber Belajar (Untuk Ditandai)</h2>
            <div className="neumorphic-card">
              <p className="text-lg mb-6 text-gray-600 leading-relaxed">
                Kami percaya pada pembelajaran berkelanjutan! Berikut beberapa sumber daya hebat yang sering kami bagikan dan bookmark untuk dipelajari... suatu saat nanti.
              </p>
              <div className="space-y-4 text-left">
                <div className="neumorphic-inset flex items-center space-x-4">
                  <i className="fab fa-youtube text-2xl text-red-600"></i>
                  <span className="text-gray-700">Channel YouTube tutorial coding (playlist 'Tonton Nanti').</span>
                </div>
                <div className="neumorphic-inset flex items-center space-x-4">
                  <i className="fas fa-book-open text-2xl text-green-600"></i>
                  <span className="text-gray-700">Dokumentasi framework terbaru (dibuka di 15 tab browser).</span>
                </div>
                <div className="neumorphic-inset flex items-center space-x-4">
                  <i className="fas fa-graduation-cap text-2xl text-blue-600"></i>
                  <span className="text-gray-700">Kursus online gratis (progres: 5% setelah 6 bulan).</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 px-6 md:px-12">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="section-title text-3xl md:text-4xl font-bold mb-10 text-gray-700">Hubungi Kami (Kalau Niat)</h2>
            <div className="neumorphic-card">
              <p className="text-lg mb-8 text-gray-600 leading-relaxed">
                Punya pertanyaan? Ide proyek (yang mungkin tidak akan kami kerjakan)? Atau hanya ingin berbagi meme programmer? Jangan ragu untuk menghubungi... tapi jangan berharap balasan cepat. Kami mungkin sedang sibuk... tidak ngoding.
              </p>
              <form action="#" method="POST" className="space-y-6">
                <div>
                  <input type="text" name="name" placeholder="Nama Anda (Opsional, biar misterius)" className="w-full p-3 neumorphic-inset focus:outline-none text-gray-700" />
                </div>
                <div>
                  <input type="email" name="email" placeholder="Email Anda (Untuk notifikasi, mungkin)" className="w-full p-3 neumorphic-inset focus:outline-none text-gray-700" />
                </div>
                <div>
                  <textarea name="message" rows={4} placeholder="Pesan Anda (Singkat saja, kami mudah lelah)" className="w-full p-3 neumorphic-inset focus:outline-none text-gray-700"></textarea>
                </div>
                <div>
                  <button type="submit" className="neumorphic-btn px-8 py-3 text-lg w-full md:w-auto">
                    Kirim Pesan (Jika Tombolnya Bekerja)
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 text-center bg-[#d1d9e6]">
        <p className="text-gray-600">&copy; 2025 IMPHNEN. Dibuat dengan penuh niat (dan sedikit copy-paste).</p>
      </footer>
    </>
  )
}

export default App
