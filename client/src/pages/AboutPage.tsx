import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import tcLogo from "@/assets/tc-logo.jpg";

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div
        className="relative py-20 px-4 sm:px-6 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(20,12%,10%) 0%, hsl(355,50%,18%) 100%)" }}
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-4">About Us 關於我們</p>
          <h1 className="font-display text-4xl md:text-5xl font-light mb-6 leading-tight">
            The Art of<br /><em className="italic text-[hsl(355,60%,70%)]">Terroir & Craft</em>
          </h1>
          <p className="font-body text-base text-white/75 max-w-2xl leading-relaxed">
            Winemaking is an art that combines nature and culture, and the harmonious resonance of 
            "Terroir and Craft" is the key to creating a fine wine.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        {/* Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(355,62%,28%)] mb-4">Our Philosophy</p>
            <h2 className="font-display text-3xl font-light mb-5">天地人 — Heaven, Earth, People</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
              The name 天地人 (Terroir and Craft) embodies our core philosophy: the perfect integration of 
              heaven (weather and climate), earth (soil and terroir), and people (the winemaker's craft) 
              is what creates truly exceptional wine.
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
              This is not just a philosophy of winemaking, but also a respect for nature, culture, and craftsmanship. 
              We uphold this philosophy and centre our operations around it, meticulously selecting each bottle.
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Our goal is to provide a comprehensive range of wine options and professional services for 
              wine enthusiasts, collectors, and clients in the catering industry in Hong Kong and Macau.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-8">
            <img src={tcLogo} alt="Terroir & Craft 天地人酒業" className="h-20 w-auto mx-auto mb-8" />
            <div className="space-y-4">
              {[
                { zh: "天 Heaven", en: "Climate & Weather" },
                { zh: "地 Earth", en: "Soil & Terroir" },
                { zh: "人 People", en: "Winemaker's Craft" },
              ].map(item => (
                <div key={item.zh} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                  <span className="font-display text-lg font-medium text-[hsl(355,62%,28%)] w-28">{item.zh}</span>
                  <span className="font-body text-sm text-muted-foreground">{item.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-16">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(355,62%,28%)] mb-4">What We Do</p>
          <h2 className="font-display text-3xl font-light mb-8">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Import & Wholesale",
                titleZh: "進口及批發",
                desc: "As exclusive brand importers, we focus on wholesale of exclusive agency brands, covering high-quality wines from France, Australia, Germany, USA, New Zealand, Portugal, and more. We provide stable supply chains and comprehensive market support.",
              },
              {
                title: "Fine Wine Investment",
                titleZh: "名莊酒投資顧問",
                desc: "Professional wine investment advisory services to assist clients in selecting suitable rare wines for effective capital appreciation. We combine market knowledge with deep wine expertise.",
              },
              {
                title: "Wine Authentication",
                titleZh: "名莊酒鑑定",
                desc: "After comparing with our exclusive and extensive database, we provide objective and professional appraisal opinions. Our authentication service covers rare vintages and collectible bottles.",
              },
            ].map(s => (
              <div key={s.title} className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-xl font-medium mb-1">{s.title}</h3>
                <p className="font-body text-xs text-[hsl(355,62%,28%)] mb-4">{s.titleZh}</p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(355,62%,28%)] mb-4">Contact Us</p>
            <h2 className="font-display text-3xl font-light mb-6">Get In Touch</h2>
            <div className="space-y-4">
              {[
                { icon: Phone, label: "Phone", value: "+852 2981 8868", href: "tel:+85229818868" },
                { icon: Mail, label: "Email", value: "info@terroirandcraft.com", href: "mailto:info@terroirandcraft.com" },
                { icon: MapPin, label: "Address", value: "Room 509, 5/F, Seaview Centre, 139 Hoi Bun Road, Kwun Tong, Hong Kong", href: null },
                { icon: Clock, label: "Hours", value: "Mon–Fri 9:00–18:00 HKT", href: null },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-md bg-[hsl(355,62%,28%)]/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-[hsl(355,62%,28%)]" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="font-body text-sm text-foreground hover:text-[hsl(355,62%,28%)] transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-body text-sm text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="mt-8">
              <p className="font-body text-xs text-muted-foreground mb-3 uppercase tracking-wide">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { name: "Instagram", href: "https://www.instagram.com/terroirandcraft", color: "hover:text-pink-500" },
                  { name: "Facebook", href: "https://www.facebook.com/terroirandcraft", color: "hover:text-blue-600" },
                  { name: "Threads", href: "https://www.threads.net/@terroirandcraft", color: "hover:text-foreground" },
                ].map(s => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-full border border-border text-sm font-body text-muted-foreground transition-colors ${s.color}`}
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-8">
            <h3 className="font-display text-xl font-medium mb-2">Trade & Wholesale Enquiries</h3>
            <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
              Are you a restaurant, hotel, or wine retailer looking for exclusive wines? 
              We offer comprehensive trade support, brand training, and customised sales strategies.
            </p>
            <div className="space-y-3">
              <a href="mailto:info@terroirandcraft.com">
                <Button className="w-full bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Us
                </Button>
              </a>
              <a href="tel:+85229818868">
                <Button variant="outline" className="w-full font-body">
                  <Phone className="w-4 h-4 mr-2" />
                  Call +852 2981 8868
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
