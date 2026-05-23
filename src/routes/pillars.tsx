import { createFileRoute } from "@tanstack/react-router";
import pillarFaith from "@/assets/pillar-faith.jpg";
import pillarWord from "@/assets/pillar-word.jpg";
import pillarSupernatural from "@/assets/pillar-supernatural.jpg";
import pillarHolyspirit from "@/assets/pillar-holyspirit.jpg";
import pillarProsperity from "@/assets/pillar-prosperity.jpg";
import pillarPrayer from "@/assets/pillar-prayer.jpg";
import pillarHealing from "@/assets/pillar-healing.jpg";
import pillarWisdom from "@/assets/pillar-wisdom.jpg";
import pillarSuccess from "@/assets/pillar-success.jpg";
import pillarVision from "@/assets/pillar-vision.jpg";
import pillarConsecration from "@/assets/pillar-consecration.jpg";
import pillarPraise from "@/assets/pillar-praise.jpg";

export const Route = createFileRoute("/pillars")({
  head: () => ({
    meta: [
      { title: "12 Pillars of Faith — Winners Chapel Dar es Salaam" },
      { name: "description", content: "The 12 pillars of our commission as given to Bishop David Oyedepo by God." },
    ],
  }),
  component: PillarsPage,
});

function PillarsPage() {
  const pillars = [
    {
      title: "Faith",
      text: "For whatsoever is born of God overcometh the world: and this is the victory that overcometh the world, even our faith.” – 1 John 5:4, Eph. 6:16",
      image: pillarFaith,
    },
    {
      title: "The Word",
      text: "Who being the brightness of his glory, and the express image of his person, and upholding all things by the word of his power...” – Heb. 1:3, John 1:1-12",
      image: pillarWord,
    },
    {
      title: "The Supernatural",
      text: "The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh... so is every one that is born of the Spirit.” – John 3:8, Ps. 82:5-7",
      image: pillarSupernatural,
    },
    {
      title: "The Holy Spirit",
      text: "And it shall come to pass in that day, that his burden shall be taken away from off thy shoulder... and the yoke shall be destroyed because of the anointing.” – Isaiah 10:27, Acts 1:1-8",
      image: pillarHolyspirit,
    },
    {
      title: "Prosperity",
      text: "Beloved, I wish above all things that thou mayest prosper and be in health, even as thy soul prospereth.” – 3 John 2, Ps. 35:27, Zech. 1:17",
      image: pillarProsperity,
    },
    {
      title: "Prayer",
      text: "And this is the confidence that we have in him, that, if we ask anything according to his will, he heareth us.” – 1 John 5:14",
      image: pillarPrayer,
    },
    {
      title: "Healing",
      text: "That it might be fulfilled which was spoken by Esaias the prophet, saying, Himself took our infirmities, and bare our sicknesses.” – Matt. 8:17, Isaiah 53:3-4; Jer. 8:22",
      image: pillarHealing,
    },
    {
      title: "Wisdom",
      text: "And wisdom and knowledge shall be the stability of thy times, and strength of salvation: the fear of the Lord is his treasure.” – Isaiah 33:6, Prov. 24:3-4",
      image: pillarWisdom,
    },
    {
      title: "Success",
      text: "This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night... for then thou shalt make thy way prosperous, and then thou shalt have good success.” – Joshua 1: 8-10",
      image: pillarSuccess,
    },
    {
      title: "Vision",
      text: "Where there is no vision, the people perish: but he that keepeth the law, happy is he.” – Prov. 29:18, Jer. 29:11",
      image: pillarVision,
    },
    {
      title: "Consecration",
      text: "Nevertheless the foundation of God standeth sure, having this seal, the Lord knoweth them that are his. And let every one that nameth the name of Christ depart from iniquity.” – 2 Tim. 2:19, Hebrews 12:14",
      image: pillarConsecration,
    },
    {
      title: "Praise",
      text: "And when they began to sing and to praise, the Lord set ambushments against the children of Ammon, Moab, and mount Seir...” – 2 Chro. 20:22, Ps. 67:1-7; 149:1-9",
      image: pillarPraise,
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">12 Pillars of Faith</h1>
          <p className="text-lg opacity-90 leading-relaxed">
            God commissioned us with the ministry of the Word of Faith to preach it to all generations and liberate the world from all oppressions of the devil.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <div key={pillar.title} className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all group">
                <div className="aspect-video overflow-hidden relative">
                  <img src={pillar.image} alt={pillar.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{pillar.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed italic">
                    {pillar.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
