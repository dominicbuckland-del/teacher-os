import Link from 'next/link'
import MarketingNav from '@/components/marketing/MarketingNav'

const S = {
  // Typography
  display: { fontFamily: 'DomaineText, serif', fontWeight: 300 } as React.CSSProperties,
  body: { fontFamily: 'GTAmerica, sans-serif', fontWeight: 300 } as React.CSSProperties,
  bodyMed: { fontFamily: 'GTAmerica, sans-serif', fontWeight: 500 } as React.CSSProperties,
}

export default function MarketingPage() {
  return (
    <div style={{ background: '#fefefc', color: '#0a0a0a', overflowX: 'hidden' }}>
      <MarketingNav />

      {/* HERO */}
      <section style={{
        background: '#191614',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 32px 80px',
        position: 'relative',
      }}>
        <p style={{
          ...S.body,
          fontSize: 11,
          letterSpacing: '0.12em',
          color: 'rgba(254,254,252,0.45)',
          textTransform: 'uppercase',
          marginBottom: 40,
        }}>
          Built for Australian teachers
        </p>
        <h1 style={{
          ...S.display,
          fontSize: 'clamp(52px, 8vw, 108px)',
          lineHeight: 1.0,
          letterSpacing: '-0.03em',
          color: '#fefefc',
          maxWidth: 900,
          marginBottom: 40,
        }}>
          The AI that writes your reports.
        </h1>
        <p style={{
          ...S.body,
          fontSize: 16,
          lineHeight: 1.7,
          color: 'rgba(254,254,252,0.55)',
          maxWidth: 480,
          marginBottom: 56,
        }}>
          Save 40+ hours every term. Report comments, rubrics, and lesson plans — built around the Australian Curriculum.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/signup" style={{
            ...S.bodyMed,
            fontSize: 13,
            background: '#fefefc',
            color: '#0a0a0a',
            padding: '14px 32px',
            borderRadius: 2,
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}>
            Start free
          </Link>
          <a href="#features" style={{
            ...S.body,
            fontSize: 13,
            background: 'transparent',
            color: 'rgba(254,254,252,0.7)',
            padding: '14px 32px',
            border: '1px solid rgba(254,254,252,0.2)',
            borderRadius: 2,
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}>
            See how it works
          </a>
        </div>

        {/* scroll hint */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: 0.3,
        }}>
          <div style={{ width: 1, height: 48, background: '#fefefc' }} />
        </div>
      </section>

      {/* LOGO STRIP */}
      <section style={{
        background: '#ecece7',
        padding: '48px 32px',
        textAlign: 'center',
      }}>
        <p style={{
          ...S.body,
          fontSize: 11,
          letterSpacing: '0.1em',
          color: 'rgba(10,10,10,0.4)',
          textTransform: 'uppercase',
          marginBottom: 32,
        }}>
          Trusted by teachers across QLD, NSW &amp; VIC
        </p>
        <div style={{
          display: 'flex',
          gap: 48,
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: 800,
          margin: '0 auto',
        }}>
          {['Creative Arts', 'English', 'Mathematics', 'Science', 'HASS', 'Health & PE', 'Technologies', 'Languages'].map(subject => (
            <span key={subject} style={{
              ...S.body,
              fontSize: 13,
              color: 'rgba(10,10,10,0.35)',
              letterSpacing: '0.04em',
            }}>
              {subject}
            </span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '120px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <p style={{
          ...S.body,
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(10,10,10,0.4)',
          marginBottom: 16,
        }}>
          What&apos;s inside
        </p>
        <h2 style={{
          ...S.display,
          fontSize: 'clamp(36px, 5vw, 60px)',
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          color: '#0a0a0a',
          maxWidth: 600,
          marginBottom: 80,
        }}>
          Every tool a teacher actually needs.
        </h2>

        <div className="mktg-3col" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
        }}>
          {[
            {
              label: 'Report Comments',
              headline: '30 students.\n20 minutes.',
              body: 'Generate personalised, curriculum-aligned comments for every student. Review, edit, approve — done.',
              tag: 'Most used',
            },
            {
              label: 'Rubric Builder',
              headline: 'Criteria you can actually use.',
              body: 'Describe the task. Get a standards-aligned rubric instantly. Customise descriptors in seconds.',
              tag: null,
            },
            {
              label: 'Lesson Planner',
              headline: 'Plans that match your class.',
              body: 'Input year level, topic, and duration. Get a full lesson plan with activities, timing, and differentiation.',
              tag: null,
            },
          ].map(feature => (
            <div key={feature.label} style={{
              background: '#ecece7',
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 360,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
                <span style={{
                  ...S.body,
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(10,10,10,0.45)',
                }}>
                  {feature.label}
                </span>
                {feature.tag && (
                  <span style={{
                    ...S.body,
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(10,10,10,0.45)',
                    border: '1px solid rgba(10,10,10,0.2)',
                    padding: '3px 8px',
                    borderRadius: 1,
                  }}>
                    {feature.tag}
                  </span>
                )}
              </div>
              <div style={{ marginTop: 80 }}>
                <h3 style={{
                  ...S.display,
                  fontSize: 32,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  color: '#0a0a0a',
                  marginBottom: 16,
                  whiteSpace: 'pre-line',
                }}>
                  {feature.headline}
                </h3>
                <p style={{
                  ...S.body,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: 'rgba(10,10,10,0.55)',
                }}>
                  {feature.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: '#ecece7', padding: '120px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{
            ...S.body,
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(10,10,10,0.4)',
            marginBottom: 16,
          }}>
            How it works
          </p>
          <h2 style={{
            ...S.display,
            fontSize: 'clamp(36px, 5vw, 60px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            marginBottom: 80,
          }}>
            Set up in minutes. Save hours every week.
          </h2>

          <div className="mktg-2col" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}>
            {[
              {
                step: '01',
                headline: 'Add your class',
                body: 'Enter your students once. Teacher OS remembers them all term.',
              },
              {
                step: '02',
                headline: 'Set the context',
                body: 'Upload your style guide, past reports, or curriculum notes. The AI writes in your voice.',
              },
              {
                step: '03',
                headline: 'Generate comments',
                body: 'Select a student, hit generate. Review the draft, make any edits, approve.',
              },
              {
                step: '04',
                headline: 'Export to your system',
                body: 'Copy plain text, or export directly to Accelerus tab-separated format. Done.',
              },
            ].map(step => (
              <div key={step.step} style={{
                background: '#fefefc',
                padding: '56px 48px',
                display: 'flex',
                gap: 32,
              }}>
                <span style={{
                  ...S.display,
                  fontSize: 13,
                  color: 'rgba(10,10,10,0.25)',
                  letterSpacing: '0.04em',
                  minWidth: 32,
                  paddingTop: 4,
                }}>
                  {step.step}
                </span>
                <div>
                  <h3 style={{
                    ...S.display,
                    fontSize: 28,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    marginBottom: 12,
                  }}>
                    {step.headline}
                  </h3>
                  <p style={{
                    ...S.body,
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: 'rgba(10,10,10,0.55)',
                  }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION */}
      <section style={{ background: '#ebf5ed', padding: '120px 32px' }}>
        <div className="mktg-2col" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <p style={{
              ...S.body,
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(10,10,10,0.4)',
              marginBottom: 24,
            }}>
              Why Teacher OS
            </p>
            <h2 style={{
              ...S.display,
              fontSize: 'clamp(36px, 4vw, 52px)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: '#0a0a0a',
            }}>
              Built by a teacher, not a tech company.
            </h2>
          </div>
          <div>
            <p style={{
              ...S.body,
              fontSize: 17,
              lineHeight: 1.8,
              color: 'rgba(10,10,10,0.65)',
              marginBottom: 24,
            }}>
              Generic AI tools don&apos;t know what a Year 10 Media Arts folio assessment looks like. They don&apos;t know ACARA. They don&apos;t know what &quot;below standard&quot; sounds like when you&apos;re trying to be kind.
            </p>
            <p style={{
              ...S.body,
              fontSize: 17,
              lineHeight: 1.8,
              color: 'rgba(10,10,10,0.65)',
            }}>
              Teacher OS was built from the inside — by a QLD teacher who was tired of spending weekends writing reports. Every prompt, every export format, every workflow was designed around how teachers actually work.
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#0a0a0a', padding: '100px 32px' }}>
        <div className="mktg-4col" style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 2,
        }}>
          {[
            { number: '40+', label: 'Hours saved per term' },
            { number: '12', label: 'Subject areas supported' },
            { number: 'v9', label: 'Australian Curriculum' },
            { number: '0', label: 'IT approvals needed' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '56px 40px',
              borderRight: '1px solid rgba(254,254,252,0.08)',
            }}>
              <p style={{
                ...S.display,
                fontSize: 64,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                color: '#fefefc',
                marginBottom: 12,
              }}>
                {stat.number}
              </p>
              <p style={{
                ...S.body,
                fontSize: 13,
                color: 'rgba(254,254,252,0.4)',
                lineHeight: 1.5,
                letterSpacing: '0.02em',
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={{ background: '#e1d5b6', padding: '120px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            ...S.display,
            fontSize: 'clamp(24px, 3.5vw, 40px)',
            lineHeight: 1.4,
            letterSpacing: '-0.02em',
            color: '#0a0a0a',
            marginBottom: 48,
          }}>
            &ldquo;I used to spend my entire Sunday on reports. Now I&apos;m done by Friday afternoon. The comments actually sound like me — I barely have to edit them.&rdquo;
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ ...S.bodyMed, fontSize: 14, color: '#0a0a0a', letterSpacing: '0.02em' }}>
              Sarah M.
            </span>
            <span style={{ ...S.body, fontSize: 13, color: 'rgba(10,10,10,0.55)', letterSpacing: '0.02em' }}>
              Year 9–10 English, Queensland
            </span>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '120px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{
            ...S.body,
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(10,10,10,0.4)',
            marginBottom: 16,
          }}>
            Pricing
          </p>
          <h2 style={{
            ...S.display,
            fontSize: 'clamp(36px, 5vw, 60px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            marginBottom: 80,
          }}>
            Less than a coffee per week.
          </h2>

          <div className="mktg-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                features: ['10 AI generations free', 'Rubric builder', 'Lesson planner', 'All subject areas'],
                cta: 'Start free',
                href: '/signup',
                highlight: false,
              },
              {
                name: 'Teacher',
                price: '$15',
                period: 'per month',
                features: ['Unlimited report comments', 'All Free features', 'Context documents (RAG)', 'Accelerus export', 'Priority generation'],
                cta: 'Start free trial',
                href: '/signup',
                highlight: true,
              },
              {
                name: 'Annual',
                price: '$99',
                period: 'per year — save 45%',
                features: ['Everything in Teacher', 'Best value', 'Locked-in price'],
                cta: 'Get annual',
                href: '/signup',
                highlight: false,
              },
            ].map(plan => (
              <div key={plan.name} style={{
                background: plan.highlight ? '#0a0a0a' : '#ecece7',
                padding: '56px 48px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <p style={{
                  ...S.body,
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: plan.highlight ? 'rgba(254,254,252,0.45)' : 'rgba(10,10,10,0.45)',
                  marginBottom: 24,
                }}>
                  {plan.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    ...S.display,
                    fontSize: 56,
                    letterSpacing: '-0.04em',
                    color: plan.highlight ? '#fefefc' : '#0a0a0a',
                  }}>
                    {plan.price}
                  </span>
                </div>
                <p style={{
                  ...S.body,
                  fontSize: 12,
                  color: plan.highlight ? 'rgba(254,254,252,0.4)' : 'rgba(10,10,10,0.4)',
                  marginBottom: 40,
                  letterSpacing: '0.02em',
                }}>
                  {plan.period}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: 48, flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{
                      ...S.body,
                      fontSize: 14,
                      color: plan.highlight ? 'rgba(254,254,252,0.7)' : 'rgba(10,10,10,0.7)',
                      padding: '10px 0',
                      borderBottom: `1px solid ${plan.highlight ? 'rgba(254,254,252,0.08)' : 'rgba(10,10,10,0.08)'}`,
                      letterSpacing: '0.01em',
                    }}>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{
                  ...S.bodyMed,
                  fontSize: 13,
                  background: plan.highlight ? '#fefefc' : '#0a0a0a',
                  color: plan.highlight ? '#0a0a0a' : '#fefefc',
                  padding: '14px 0',
                  textAlign: 'center',
                  textDecoration: 'none',
                  borderRadius: 2,
                  letterSpacing: '0.02em',
                  display: 'block',
                }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#191614', padding: '120px 32px', textAlign: 'center' }}>
        <p style={{
          ...S.body,
          fontSize: 11,
          letterSpacing: '0.12em',
          color: 'rgba(254,254,252,0.35)',
          textTransform: 'uppercase',
          marginBottom: 32,
        }}>
          Start today
        </p>
        <h2 style={{
          ...S.display,
          fontSize: 'clamp(40px, 6vw, 80px)',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: '#fefefc',
          maxWidth: 700,
          margin: '0 auto 48px',
        }}>
          Your weekends back, starting this term.
        </h2>
        <Link href="/signup" style={{
          ...S.bodyMed,
          fontSize: 13,
          background: '#fefefc',
          color: '#0a0a0a',
          padding: '16px 40px',
          borderRadius: 2,
          textDecoration: 'none',
          letterSpacing: '0.02em',
          display: 'inline-block',
        }}>
          Start free — no credit card required
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a0a0a', padding: '80px 32px 48px', borderTop: '1px solid rgba(254,254,252,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="mktg-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 80 }}>
            <div>
              <p style={{
                ...S.display,
                fontSize: 22,
                letterSpacing: '-0.02em',
                color: '#fefefc',
                marginBottom: 16,
              }}>
                Teacher OS
              </p>
              <p style={{
                ...S.body,
                fontSize: 13,
                color: 'rgba(254,254,252,0.35)',
                lineHeight: 1.7,
                maxWidth: 260,
              }}>
                The AI operating system for Australian teachers. Built to save time, not add to it.
              </p>
            </div>
            {[
              {
                heading: 'Product',
                links: ['Report Comments', 'Rubric Builder', 'Lesson Planner', 'Pricing'],
              },
              {
                heading: 'Resources',
                links: ['How it works', 'For schools', 'Australian Curriculum'],
              },
              {
                heading: 'Legal',
                links: ['Privacy Policy', 'Terms of Service'],
              },
            ].map(col => (
              <div key={col.heading}>
                <p style={{
                  ...S.bodyMed,
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(254,254,252,0.35)',
                  marginBottom: 20,
                }}>
                  {col.heading}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" style={{
                        ...S.body,
                        fontSize: 13,
                        color: 'rgba(254,254,252,0.45)',
                        textDecoration: 'none',
                        letterSpacing: '0.01em',
                      }}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 32,
            borderTop: '1px solid rgba(254,254,252,0.06)',
          }}>
            <p style={{ ...S.body, fontSize: 12, color: 'rgba(254,254,252,0.25)', letterSpacing: '0.02em' }}>
              © 2026 Teacher OS. Made in Queensland, Australia.
            </p>
            <p style={{ ...S.body, fontSize: 12, color: 'rgba(254,254,252,0.25)', letterSpacing: '0.02em' }}>
              Powered by Claude AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
