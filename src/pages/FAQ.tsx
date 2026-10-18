import Footer from '@/components/Footer';
import Seo from '@/components/Seo';

interface FaqEntry {
  question: string;
  answer: string;
}

const FAQ_GROUPS: { title: string; entries: FaqEntry[] }[] = [
  {
    title: 'General Questions',
    entries: [
      { question: "Is everything on Renderdragon really free?", answer: "Yes. Every resource, tool, and guide on Renderdragon is free to use." },
      { question: "Do I need to credit Renderdragon when using resources?", answer: "No, but it helps. A mention or a link gets the site in front of more creators." },
      { question: "Can I use resources for commercial projects?", answer: "Yes, you can use our resources in your commercial projects unless specifically stated otherwise on the resource page." },
    ],
  },
  {
    title: 'Technical Questions',
    entries: [
      { question: "What file formats do you support?", answer: "PNG, MP3, WAV, and PSD among others. Each resource lists the formats it ships in." },
      { question: "Are the tools compatible with my device?", answer: "The tools run in the browser, so any modern browser on Windows, macOS, or Linux works." },
      { question: "What if I encounter technical issues?", answer: "Ask in our Discord or use the contact page and we'll take a look." },
    ],
  },
  {
    title: 'Resource Usage',
    entries: [
      { question: "Can I modify the resources?", answer: "Yes. Edit, crop, recolour, whatever the project needs." },
      { question: "Are there any usage restrictions?", answer: "Don't resell or reupload resources as they are, and don't claim them as your own." },
      { question: "What about copyright claims?", answer: "We check what we can, but read the terms on the resource page before you publish, especially for music and sound effects." },
    ],
  },
  {
    title: 'Contact & Support',
    entries: [
      { question: "How can I get help?", answer: "Join our Discord for quick answers, or use the contact page. We usually reply within 48 hours." },
      { question: "Can I suggest new features or resources?", answer: "Yes. Post them in Discord or send them through the contact page." },
      { question: "How can I support Renderdragon?", answer: "Tell other creators about it, credit us when you use our stuff, or donate if you can." },
    ],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((group) => group.entries).map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

const FAQ = () => {

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="FAQ - Renderdragon"
        description="Answers on free assets, credits, commercial use, file formats, and copyright claims, plus how to get help."
        path="/faq"
        jsonLd={faqSchema}
      />


      <main className="flex-grow pt-24 pb-16 cow-grid-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl mb-8 text-center">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>

            <div className="rounded-xl border border-border bg-card p-4 space-y-6">
              <div className="space-y-8 text-muted-foreground">
                {FAQ_GROUPS.map((group, groupIndex) => (
                  <div key={group.title}>
                    <h2 className={`text-2xl ${groupIndex === 0 ? '' : ''} text-foreground mb-4`}>
                      {group.title}
                    </h2>

                    <div className="space-y-6">
                      {group.entries.map(({ question, answer }) => (
                        <div key={question}>
                          <h3 className="text-lg font-medium text-foreground mb-2">{question}</h3>
                          <p>{answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

    </div>
  );
};

export default FAQ;
