import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { CursorInteraction } from "@/components/motion/cursor-interaction";
import { MotionProvider } from "@/components/motion/motion-provider";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { site } from "@/content/site";
import { routing, type Locale } from "@/i18n/routing";
import { brandColors } from "@/lib/brand";
import { previewBootScript, previewImagesEnabled } from "@/lib/preview";
import {
  buildLanguageAlternates,
  absoluteUrl,
  localizedPath,
  openGraphLocale,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import "../globals.css";

/* Sora — tipografia de apoio oficial da marca, servida localmente. */
const sora = localFont({
  src: [
    { path: "../../fonts/Sora-Light.ttf", weight: "300", style: "normal" },
    { path: "../../fonts/Sora-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../fonts/Sora-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../fonts/Sora-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../fonts/Sora-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../fonts/Sora-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-sora",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: brandColors.white },
    { media: "(prefers-color-scheme: dark)", color: brandColors.black },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "seo.home" });

  return {
    metadataBase: new URL(site.url),
    title: {
      default: t("title"),
      template: `%s — ${site.shortName}`,
    },
    description: t("description"),
    applicationName: site.shortName,
    generator: undefined,
    referrer: "origin-when-cross-origin",
    formatDetection: { telephone: false },
    alternates: {
      canonical: absoluteUrl(localizedPath(locale, "/")),
      languages: buildLanguageAlternates("/"),
    },
    openGraph: {
      type: "website",
      siteName: site.shortName,
      locale: openGraphLocale(locale),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "a11y" });
  const typedLocale = locale as Locale;

  return (
    <html lang={locale} className={sora.variable} suppressHydrationWarning>
      <body data-surface="light" className="antialiased">
        {/* Ferramenta de trabalho: restaura o interruptor de pré-visualização
            de imagens antes da primeira pintura, para não piscar entre o
            painel institucional e a imagem de exemplo. Some da build assim
            que NEXT_PUBLIC_PREVIEW_IMAGES sai do ar. */}
        {previewImagesEnabled ? (
          <script
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: previewBootScript }}
          />
        ) : null}

        <NextIntlClientProvider>
          <MotionProvider>
            <a className="skip-link" href="#conteudo">
              {t("skipToContent")}
            </a>

            <ScrollProgress label={t("scrollProgress")} />
            <Header />

            <main id="conteudo" tabIndex={-1}>
              {children}
            </main>

            <Footer />
            <CursorInteraction />
          </MotionProvider>
        </NextIntlClientProvider>

        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              organizationJsonLd(typedLocale),
              websiteJsonLd(typedLocale),
            ]),
          }}
        />
      </body>
    </html>
  );
}
