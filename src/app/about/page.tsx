export default function About() {
  const cards = [
    {
      title: 'About AgriLink Lanka',
      content: `AgriLink Lanka is a modern B2B web platform dedicated to transforming Sri Lanka's agricultural export sector. Our mission is to empower farmers by providing direct access to global exporters, eliminating intermediaries, and ensuring fair, transparent trade.`,
    },
    {
      title: 'Our Vision',
      content: `We envision a future where every Sri Lankan farmer, regardless of scale, can reach reliable export markets, maximize profits, and contribute to a sustainable agricultural economy. By leveraging technology, we bridge the gap between smallholders and large-scale buyers, fostering trust and efficiency.`,
    },
    {
      title: 'Why AgriLink Lanka?',
      content: (
        <ul className="list-disc pl-6 space-y-1">
          <li>Open registration for all farmers to list vegetables directly</li>
          <li>Transparent, admin-verified exporter network</li>
          <li>Inclusive platform for small and large-scale producers</li>
          <li>Secure, real-time payments via Stripe</li>
          <li>Automated notifications and order tracking</li>
          <li>Modern, scalable technology stack (Next.js, ASP.NET Core, PostgreSQL)</li>
        </ul>
      ),
    },
    {
      title: 'Our Objectives',
      content: (
        <ul className="list-disc pl-6 space-y-1">
          <li>Empower farmers to manage and export their produce efficiently</li>
          <li>Enable exporters to source quality crops with confidence</li>
          <li>Ensure secure, transparent transactions and communication</li>
          <li>Support admin oversight for platform integrity and growth</li>
        </ul>
      ),
    },
    {
      title: '',
      content: <p className="text-green-900 font-semibold text-center">Together, we are building a fair, efficient, and sustainable future for Sri Lankan agriculture.</p>,
    },
  ];

  return (
    <div
      className="relative min-h-screen w-full py-16 px-2 flex flex-col items-center justify-center bg-white"
      style={{
        backgroundImage: "url('https://res.cloudinary.com/dgyqfax25/image/upload/v1759846858/top-view-vegetables-with-free-place-your-text-dark-grey-green-background_s0uopp.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-white/0 backdrop-blur-[0px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-4xl flex flex-col gap-10">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`group w-full md:w-3/4 mx-auto p-8 rounded-3xl shadow-2xl border border-white/60 bg-white/40 backdrop-blur-lg transition-transform duration-300 hover:scale-105 ${
              idx % 2 === 0 ? 'self-start md:ml-0 md:mr-auto' : 'self-end md:mr-0 md:ml-auto'
            }`}
            style={{
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            {card.title && (
              <h2 className="text-2xl font-bold text-green-800 mb-2 drop-shadow-lg text-center md:text-left">{card.title}</h2>
            )}
            <div className="text-gray-800 text-lg leading-relaxed">
              {card.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
