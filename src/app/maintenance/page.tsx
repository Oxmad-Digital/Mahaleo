import Image from "next/image";
import Link from "next/link";
import guitar from "../../assets/mahaleo/guitar-retro.webp";
import logo from "../../assets/mahaleo/logo-mahaleo.png";

export const metadata = {
  title: { absolute: "Site en maintenance — Mahaleo" },
  description: "La boutique officielle Mahaleo fait une courte pause technique.",
};

export default function MaintenancePage() {
  return (
    <main className="retro-maintenance">
      <div className="retro-maintenance-edition" aria-label="Informations éditoriales">
        <span>ANTSIRABE · MADAGASCAR</span>
        <span>LA MUSIQUE EN HÉRITAGE</span>
        <span>DEPUIS 1972</span>
      </div>

      <header className="retro-maintenance-header">
        <div className="retro-maintenance-context">
          <strong>BOUTIQUE OFFICIELLE</strong>
          <span>Vêtements officiels du groupe</span>
        </div>
        <Image
          className="retro-maintenance-logo"
          src={logo}
          alt="Mahaleo"
          priority
          sizes="(max-width: 600px) 175px, 265px"
        />
        <div className="retro-maintenance-status">
          <i aria-hidden="true" />
          <span>Maintenance en cours</span>
        </div>
      </header>

      <div className="retro-maintenance-stage">
        <aside className="retro-maintenance-visual" aria-hidden="true">
          <div className="retro-maintenance-panel-label">
            <span>ARCHIVES MAHALEO</span>
            <span>01 / 01</span>
          </div>
          <div className="retro-maintenance-photo">
            <Image src={guitar} alt="" fill priority sizes="(max-width: 900px) 100vw, 36vw" />
            <div>
              <span>UNE COURTE PAUSE</span>
              <strong>POUR MIEUX REVENIR.</strong>
            </div>
          </div>
          <p>Le nom d’un groupe. Le lien entre des générations.</p>
        </aside>

        <section className="retro-maintenance-content">
          <div className="retro-maintenance-copy">
            <span className="retro-maintenance-kicker">ENTRACTE TECHNIQUE · N° 01</span>
            <h1>
              LE SITE
              <em>SE PRÉPARE.</em>
            </h1>
            <p>
              Nous accordons les derniers détails de la boutique. Elle sera de nouveau disponible très prochainement.
            </p>
          </div>

          <div className="retro-maintenance-progress" aria-label="Maintenance en cours">
            <div>
              <span>RÉGLAGES EN COURS</span>
              <strong>Retour prochainement</strong>
            </div>
            <span aria-hidden="true"><i /></span>
          </div>

          <ol className="retro-maintenance-steps">
            <li>
              <strong>01</strong>
              <span>Mise à jour</span>
            </li>
            <li>
              <strong>02</strong>
              <span>Vérification</span>
            </li>
            <li>
              <strong>03</strong>
              <span>Réouverture</span>
            </li>
          </ol>

          <div className="retro-maintenance-note">
            <p>Merci pour votre patience et votre fidélité.</p>
            <Link href="/connexion">
              Connexion administrateur
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>

      <footer className="retro-maintenance-footer">
        <span>MAHALEO · DEPUIS 1972</span>
        <span>La musique continue bientôt.</span>
        <span>ANTSIRABE · MADAGASCAR</span>
      </footer>
    </main>
  );
}
