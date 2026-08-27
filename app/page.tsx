import PublicNav from "./components/public-nav";

export default function Home() {
  return (
    <main>
      <section className="hero" id="home">
        <PublicNav />
        <div className="hero-content wrap"><p className="eyebrow light">North Georgia · Since 2005</p><h1>A good place<br /><span>to come home to.</span></h1><p className="hero-copy">Surrounded by several Georgia State Parks that offer hiking trails, kayaking, fishing and much more!</p><a className="round-link" href="#welcome" aria-label="Explore Teel Mountain">Explore <span aria-hidden="true">↓</span></a></div>
        <div className="hero-note"><span>North Georgia foothills</span><span className="note-rule" /><span>Cleveland · Helen</span></div>
      </section>
      <section className="welcome wrap" id="welcome"><div className="section-kicker"><span>01</span><span className="kicker-line" /><span>Life at Teel Mountain</span></div><div className="welcome-grid"><h2>Rooted in the<br /><i>good stuff.</i></h2><div className="welcome-copy"><p>Teel Mountain Subdivision is in beautiful Cleveland, Georgia, the Gateway to the Mountains. We began in 2005 and are seated on nearly 76 acres of wooded land.</p><a className="text-link" href="#contact">Meet your neighbors <span>↗</span></a></div></div><div className="stats"><div><strong>48</strong><span>peaceful homes</span></div><div><strong>5</strong><span>miles from shopping and restaurants</span></div><div><strong>4</strong><span>seasons to enjoy</span></div></div></section>
      <section className="rules-section" id="rules"><div className="wrap rules-layout"><div><div className="section-kicker dark-kicker"><span>02</span><span className="kicker-line" /><span>Good neighbors</span></div><h2>Our shared<br /><i>way of life.</i></h2><p className="rules-intro">A few simple guidelines help keep Teel Mountain beautiful, peaceful, and welcoming for everyone.</p><a className="outline-link" href="#contact">View complete covenants <span>↗</span></a></div><div className="rule-list"><article><span>01</span><div><h3>Care for the land</h3><p>Protect our trees, waterways, and mountain views. Native landscaping is always encouraged.</p></div></article><article><span>02</span><div><h3>Keep it neighborly</h3><p>Quiet hours are 10pm–7am. Please be considerate with gatherings, pets, and shared spaces.</p></div></article><article><span>03</span><div><h3>Build with intention</h3><p>Exterior changes and new structures require architectural review before work begins.</p></div></article></div></div></section>
      <section className="contact wrap" id="contact"><div className="section-kicker"><span>03</span><span className="kicker-line" /><span>Stay in touch</span></div><div className="contact-grid"><div><h2>We’re here<br /><i>to help.</i></h2><p>Questions about your home, the neighborhood, or an upcoming meeting? Feel free to reach out.</p></div><div className="contact-details"><div><span className="detail-label">Mailing address</span><p>P.O. Box 3354<br />Cleveland, GA 30528</p></div><div><span className="detail-label">Get in touch</span><p><a href="mailto:hoa@teelmountain.com">hoa@teelmountain.com</a></p></div></div></div></section>
      <footer className="footer"><div className="wrap footer-inner"><span>© 2026 Teel Mountain HOA</span><span>Made for mountain living <i>⌁</i></span><a href="#home">Back to top ↑</a></div></footer>
    </main>
  );
}
