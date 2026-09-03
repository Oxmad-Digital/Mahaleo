import Link from "next/link";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { IconRail } from "@/components/scene/IconRail";
import { Footer } from "@/components/scene/Footer";
import { BagIcon, GridIcon, LocationDotIcon, MenuIcon } from "@/components/icons";
import { capped, vmin } from "@/lib/fluid";

const PRODUCT_IMAGE = "/images/product-photo-sample.webp";

function HeaderIconButton({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: vmin(40),
        height: vmin(40),
        flex: "none",
        borderRadius: "var(--radius-pill)",
        background: "var(--glass-pill-bg)",
        border: "1px solid var(--glass-pill-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <Scene>
      <TopBar
        left={
          <>
            <LogoPill />
            <HeaderIconButton>
              <LocationDotIcon />
            </HeaderIconButton>
            <HeaderIconButton>
              <GridIcon />
            </HeaderIconButton>
            <HeaderIconButton>
              <MenuIcon />
            </HeaderIconButton>
          </>
        }
        right={
          <Link
            href="/panier"
            style={{
              display: "flex",
              alignItems: "center",
              gap: vmin(10),
              padding: `${vmin(10)} ${vmin(22)}`,
              borderRadius: "var(--radius-pill)",
              background: "var(--glass-pill-bg)",
              border: "1px solid var(--glass-pill-border)",
            }}
          >
            <BagIcon />
            <span style={{ fontSize: vmin(15), fontWeight: 500, whiteSpace: "nowrap" }}>
              Passer la commande
            </span>
          </Link>
        }
      />

      <div
        className="home-hero-row"
        style={{
          position: "absolute",
          top: vmin(44),
          left: 0,
          right: 0,
          height: vmin(676),
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: vmin(80),
          padding: `0 ${vmin(90)}`,
        }}
      >
        <Link
          href="/produit"
          className="home-side-item"
          style={{
            width: vmin(250),
            flex: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: vmin(20),
          }}
        >
          <img
            src={PRODUCT_IMAGE}
            alt="Pull crème brodé"
            style={{
              width: vmin(250),
              height: vmin(250),
              objectFit: "contain",
              filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.28))",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: vmin(6),
            }}
          >
            <div style={{ fontSize: vmin(19), fontWeight: 600, whiteSpace: "nowrap" }}>
              T-shirt à impression basique
            </div>
            <div style={{ fontSize: vmin(28), fontWeight: 700, lineHeight: 1 }}>35 €</div>
          </div>
        </Link>

        <Link href="/produit" style={{ flex: "none", alignSelf: "flex-start" }}>
          <img
            src={PRODUCT_IMAGE}
            alt="Pull crème brodé — produit sélectionné"
            style={{
              width: vmin(420),
              height: vmin(580),
              marginTop: vmin(34),
              objectFit: "contain",
              filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.32))",
            }}
          />
        </Link>

        <Link
          href="/produit"
          className="home-side-item"
          style={{
            width: vmin(250),
            flex: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: vmin(20),
          }}
        >
          <img
            src={PRODUCT_IMAGE}
            alt="Pull crème brodé"
            style={{
              width: vmin(250),
              height: vmin(250),
              objectFit: "contain",
              filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.28))",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: vmin(6),
            }}
          >
            <div style={{ fontSize: vmin(19), fontWeight: 600, whiteSpace: "nowrap" }}>
              T-shirt basique
            </div>
            <div style={{ fontSize: vmin(28), fontWeight: 700, lineHeight: 1 }}>35 €</div>
          </div>
        </Link>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: vmin(232),
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: vmin(10),
        }}
      >
        <div style={dotStyle(false)} />
        <div style={dotStyle(true)} />
        <div style={dotStyle(false)} />
        <div style={dotStyle(false)} />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: vmin(110),
          left: "50%",
          transform: "translateX(-50%)",
          width: capped(500),
          boxSizing: "border-box",
          padding: vmin(20),
          borderRadius: "var(--radius-lg)",
          background:
            "linear-gradient(180deg, var(--glass-fill-strong-top), var(--glass-fill-strong-bottom))",
          border: "1px solid var(--glass-border-strong)",
          backdropFilter: "blur(var(--blur-heavy))",
          WebkitBackdropFilter: "blur(var(--blur-heavy))",
          boxShadow: "var(--shadow-cta-strong)",
          display: "flex",
          flexDirection: "column",
          gap: vmin(18),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: vmin(16),
            padding: `0 ${vmin(4)}`,
          }}
        >
          <span style={{ fontSize: vmin(21), fontWeight: 600, whiteSpace: "nowrap" }}>
            T-shirt meilleure collection
          </span>
          <span style={{ fontSize: vmin(28), fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>
            35 €
          </span>
        </div>
      </div>

      <IconRail active="shop" />
      <Footer />
    </Scene>
  );
}

function dotStyle(active: boolean): React.CSSProperties {
  return active
    ? {
        width: vmin(30),
        height: vmin(9),
        borderRadius: "var(--radius-pill)",
        background: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }
    : {
        width: vmin(9),
        height: vmin(9),
        borderRadius: "var(--radius-pill)",
        background: "var(--text-on-scene-quaternary)",
      };
}
