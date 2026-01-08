import { Shield, Mail, Clock } from 'lucide-react';
import logo from '../assets/logo.png';
import landingPic from '../assets/landingPic.png';

function LandingPage({ onStartQuiz }) {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 100; // Adjust this value based on your navbar height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

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
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
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
      transition: 'color 0.2s',
      cursor: 'pointer'
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
    },
    section: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 2rem'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: '1rem'
    },
    sectionSubtitle: {
      fontSize: '1.2rem',
      color: '#6B7280',
      marginBottom: '3rem'
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginTop: '2rem'
    },
    card: {
      background: 'white',
      padding: '2rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(79, 70, 229, 0.1), 0 0 0 3px #8B5CF6',
      position: 'relative',
      transition: 'transform 0.2s'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: '1rem'
    },
    cardText: {
      fontSize: '1rem',
      color: '#4B5563',
      lineHeight: '1.6'
    },
    contactInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
      fontSize: '1.1rem',
      color: '#1F2937'
    },
    iconCircle: {
      background: '#4F46E5',
      borderRadius: '50%',
      padding: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    faqSection: {
      background: 'white',
      padding: '4rem 2rem'
    },
    faqItem: {
      background: '#F9FAFB',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      marginBottom: '1rem',
      border: '2px solid #E5E7EB'
    },
    faqQuestion: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: '0.5rem'
    },
    faqAnswer: {
      fontSize: '1rem',
      color: '#6B7280',
      lineHeight: '1.6'
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
          <li>
            <a 
              href="#home" 
              onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} 
              style={{...styles.navLink, ...styles.navLinkActive}}
            >
              Home
            </a>
          </li>
          <li>
            <a 
              href="#help" 
              onClick={(e) => { e.preventDefault(); scrollToSection('help'); }} 
              style={styles.navLink}
            >
              Help
            </a>
          </li>
          <li>
            <a 
              href="#contact" 
              onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} 
              style={styles.navLink}
            >
              Contact Us
            </a>
          </li>
          <li>
            <a 
              href="#faq" 
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }} 
              style={styles.navLink}
            >
              FAQ
            </a>
          </li>
        </ul>
      </div>

      {/* Hero Section */}
      <div id="home" style={styles.hero}>
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

      {/* Help Center Section */}
      <div id="help" style={{...styles.section, background: 'white', borderRadius: '20px', border: '3px solid #8B5CF6'}}>
        <h2 style={styles.sectionTitle}>HELP CENTER</h2>
        <p style={styles.sectionSubtitle}>
          Welcome to Quiz Now. Below are the key things you need to know before taking a quiz.
        </p>
        
        <div style={styles.cardsContainer}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>How to start a quiz</h3>
            <p style={styles.cardText}>
              Click the "Let's Start Now" button on the home page to begin. Make sure you 
              carefully read all instructions before answering. A stable internet connection 
              is recommended for a smooth experience.
            </p>
          </div>
          
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Quiz Rules & Monitoring</h3>
            <p style={styles.cardText}>
              Quiz Now monitors interaction behavior to ensure fairness. This includes tracking 
              time spent on questions and tab switching. The system does not access your camera 
              or microphone.
            </p>
          </div>
          
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Technical Support</h3>
            <p style={styles.cardText}>
              If you experience issues such as loading errors or failed submissions, check your 
              internet connection and browser. For unresolved problems, please visit the Contact 
              Us page for assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div id="contact" style={styles.section}>
        <h2 style={styles.sectionTitle}>CONTACT US</h2>
        <p style={styles.sectionSubtitle}>
          Have a question or experiencing an issue while using Quiz Now? We're here to help 
          and would love to hear from you.
        </p>
        <p style={{...styles.sectionSubtitle, marginBottom: '2rem'}}>
          You may contact us through the details below or send us a message directly using the form.
        </p>
        
        <div style={styles.contactInfo}>
          <div style={styles.iconCircle}>
            <Mail size={24} color="white" />
          </div>
          <span>support@quiznow.com</span>
        </div>
        
        <div style={styles.contactInfo}>
          <div style={styles.iconCircle}>
            <Clock size={24} color="white" />
          </div>
          <span>Monday – Friday, 9:00 AM – 5:00 PM</span>
        </div>
        
        <h3 style={{...styles.cardTitle, marginTop: '2rem', marginBottom: '1rem'}}>
          Send Us a Message
        </h3>
        <p style={styles.cardText}>
          Please provide your name, email address, and message. Our support team will respond 
          as soon as possible.
        </p>
      </div>

      {/* FAQ Section */}
      <div id="faq" style={styles.faqSection}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <h2 style={styles.sectionTitle}>FAQ</h2>
          <p style={styles.sectionSubtitle}>
            Frequently asked questions about Quiz Now
          </p>
          
          <div style={styles.faqItem}>
            <h4 style={styles.faqQuestion}>How do I start a quiz?</h4>
            <p style={styles.faqAnswer}>
              Simply click the "Let's Start Now!" button on the home page. Make sure you have 
              a stable internet connection before beginning.
            </p>
          </div>
          
          <div style={styles.faqItem}>
            <h4 style={styles.faqQuestion}>What does the monitoring system track?</h4>
            <p style={styles.faqAnswer}>
              The system tracks interaction behavior such as time spent on questions and tab 
              switching to ensure quiz integrity. We do not access your camera or microphone.
            </p>
          </div>
          
          <div style={styles.faqItem}>
            <h4 style={styles.faqQuestion}>What should I do if I experience technical issues?</h4>
            <p style={styles.faqAnswer}>
              First, check your internet connection and try refreshing your browser. If problems 
              persist, contact our support team at support@quiznow.com or use the contact form.
            </p>
          </div>
          
          <div style={styles.faqItem}>
            <h4 style={styles.faqQuestion}>Can I retake a quiz?</h4>
            <p style={styles.faqAnswer}>
              Quiz retake policies depend on your instructor or organization's settings. Contact 
              them directly for information about retaking specific quizzes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;