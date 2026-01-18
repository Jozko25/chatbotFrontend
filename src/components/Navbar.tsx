import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.inner}>
                <a href="#hero" className={styles.brand}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    SiteBot
                </a>

                <div className={styles.menu}>
                    <a href="#features" className={styles.link}>Features</a>
                    <a href="#how" className={styles.link}>How it works</a>
                    <a href="#cta" className={styles.cta}>Get Started</a>
                </div>
            </div>
        </nav>
    );
}
