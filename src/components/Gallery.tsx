import { THEME } from "@/theme";
import { motion } from "framer-motion";

export function Gallery() {
  const photos = [
    { src: "/images/city-bridge.jpg", webp: "/images/city-bridge.webp", alt: "Sunlit domed building by a bridge with cyclist in motion" },
    { src: "/images/crosswalk-sun.jpg", webp: "/images/crosswalk-sun.webp", alt: "City crosswalk at golden hour with long shadows" },
    { src: "/images/cyclist-truck.jpg", webp: "/images/cyclist-truck.webp", alt: "Cyclist passing a parked truck in afternoon light" }
  ];

  return (
    <section className={`${THEME.layout.padX} py-8 md:py-10`}>
      <div className={`${THEME.layout.maxW} mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-4`}>
        {photos.map((p, i) => (
          <motion.figure
            key={p.src}
            className="card overflow-hidden"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
          >
            <picture>
              <source srcSet={p.webp} type="image/webp" />
              <img src={p.src} alt={p.alt} loading="lazy" className="w-full h-56 md:h-64 object-cover" />
            </picture>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

