import { Shield } from 'lucide-react';
import logo from '../assets/logo.png';
import landingPic from '../assets/landingPic.png';

function LandingPage({ onStartQuiz }) {
  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    navbar: {
      background: 'white',
      padding: '1.5rem 3rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    logoImage: {
      height: '50px',
      width: 'auto'
    },
    navMenu: {
      display: 'flex',
      listStyle: 'none',
      gap: '3rem',
      margin: 0,
      padding: 0
    },
    navLink: {
      color: '#4F46E5',
      textDecoration: 'none',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'color 0.2s'
    },
    navLinkActive: {
      color: '#4F46E5',
      fontWeight: '700'
    },
    hero: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 2rem',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4rem',
      alignItems: 'center',
      minHeight: 'calc(100vh - 100px)'
    },
    heroContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      lineHeight: '1.1',
      margin: 0
    },
    take: {
      color: '#4F46E5'
    },
    test: {
      color: '#FCD34D'
    },
    heroSubtitle: {
      fontSize: '1.5rem',
      color: '#4F46E5',
      fontWeight: '600',
      margin: '0.5rem 0'
    },
    heroDescription: {
      fontSize: '1.1rem',
      color: '#6B7280',
      lineHeight: '1.6'
    },
    startButton: {
      background: '#4F46E5',
      color: 'white',
      padding: '1rem 2.5rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      border: 'none',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 4px 6px rgba(79, 70, 229, 0.3)',
      alignSelf: 'flex-start'
    },
    heroImage: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    image: {
      width: '100%',
      maxWidth: '500px',
      height: 'auto'
    }
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.logo}>
      <img src={logo} alt="QuizNow Logo" style={styles.logoImage} />
        </div>
        <ul style={styles.navMenu}>
          <li><a href="/" style={{...styles.navLink, ...styles.navLinkActive}}>Home</a></li>
          <li><a href="/help" style={styles.navLink}>Help</a></li>
          <li><a href="/contact" style={styles.navLink}>Contact Us</a></li>
          <li><a href="/faq" style={styles.navLink}>FAQ</a></li>
        </ul>
      </div>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h2 style={styles.heroTitle}>
            <span style={styles.take}>TAKE </span>
            <span style={styles.test}>TEST</span>
          </h2>
          <h3 style={styles.heroSubtitle}>
            Test Your Knowledge & Track Your Progress
          </h3>
          <p style={styles.heroDescription}>
            This quiz system monitors your interaction behavior to detect automated assistance
          </p>
          <button
            style={styles.startButton}
            onClick={onStartQuiz}
            onMouseEnter={(e) => {
              e.target.style.background = '#4338CA';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(79, 70, 229, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#4F46E5';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(79, 70, 229, 0.3)';
            }}
          >
            Let's Start Now!
          </button>
        </div>
        <div style={styles.heroImage}>
         <img src={landingPic} alt="Workers" style={styles.image} />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;