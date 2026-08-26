"use client";
import React, { useState } from "react";

const faqs = [
  {
    question: "What is Flourish?",
    answer: "Flourish is a platform designed to help teams and individuals bring their ideas to life through collaboration and innovation.",
  },
  // {
  //   question: "How do I join a team?",
  //   answer: "You can join a team by browsing available projects and sending a request to join, or by accepting an invitation from an existing team member.",
  // },
  // {
  //   question: "Is Flourish free to use?",
  //   answer: "We offer a free tier with core features. Premium features are available with a subscription plan.",
  // },
  {
    question: "Can I use Flourish for personal projects?",
    answer: "Absolutely! Flourish is perfect for both personal and professional projects.",
  },
  // {
  //   question: "How do I reset my password?",
  //   answer: "Click on 'Forgot Password' at the login page and follow the instructions to reset your password.",
  // },
  {
    question: "How do I contact support?",
    answer: "You can reach out to our support team via the Contact Us page or by emailing vendor@flourishideas.com.",
  },
];

const FaqSection: React.FC = () => {
  const [openStates, setOpenStates] = useState(faqs.map(() => false));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenStates(prev => {
      const newStates = [...prev];
      newStates[idx] = !newStates[idx];
      return newStates;
    });
  };

  const isActive = (idx: number) => hoveredIndex === idx;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto my-16 px-4 flex flex-col items-center justify-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center mb-6" style={{marginBottom: '2.5rem'}}>Frequently Asked Questions</h2>
        <div className="w-full bg-transparent">
          {/* Top line before the first question */}
          <div
            className="w-full transition-colors duration-300"
            style={{
              height: '1.5px',
              backgroundColor: hoveredIndex === 0 ? '#1f98f4' : '#e5e7eb',
            }}
          />
          {faqs.map((faq, idx) => (
            <React.Fragment key={idx}>
              <div
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Question Row */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={openStates[idx]}
                  aria-controls={`faq-answer-${idx}`}
                  className="w-full flex items-center justify-between select-none text-gray-900 focus:outline-none transition-colors"
                  style={{
                    background: '#fff',
                    paddingTop: '1.1rem',
                    paddingBottom: '1.1rem',
                    paddingLeft: '1.5rem',
                    paddingRight: '1.5rem',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => handleToggle(idx)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleToggle(idx)}
                >
                  <span style={{fontWeight: 500, fontSize: '1.1rem'}}>{faq.question}</span>
                  <div className="relative flex-shrink-0 w-3 h-3 ml-4">
                    <span
                      className="block absolute w-full h-[2px] bg-gray-900 transition-transform duration-300 ease-out"
                      style={{
                        top: '50%',
                        transform: `translateY(-50%) rotate(${openStates[idx] ? 45 : 0}deg)`,
                      }}
                    />
                    <span
                      className="block absolute w-full h-[2px] bg-gray-900 transition-transform duration-300 ease-out"
                      style={{
                        top: '50%',
                        transform: `translateY(-50%) rotate(${openStates[idx] ? -45 : 90}deg)`,
                      }}
                    />
                  </div>
                </div>
                {/* Separator between question and answer */}
                {openStates[idx] && (
                  <div
                    className="w-full transition-colors duration-300"
                    style={{
                      height: '1.5px',
                      backgroundColor: hoveredIndex === idx ? '#1f98f4' : '#e5e7eb',
                      margin: 0,
                    }}
                  />
                )}
                {/* Answer Container using Grid for smooth animation */}
                <div
                  id={`faq-answer-${idx}`}
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{
                    gridTemplateRows: openStates[idx] ? '1fr' : '0fr',
                    background: '#fff',
                  }}
                  aria-hidden={!openStates[idx]}
                >
                  {/* Inner content wrapper */}
                  <div className="overflow-hidden">
                    <div
                      style={{
                        paddingTop: '0.75rem',
                        paddingBottom: '1rem',
                        paddingLeft: '1.5rem',
                        paddingRight: '0.5rem',
                      }}
                    >
                      <p className="text-gray-600" style={{ fontWeight: 400, fontSize: '1rem' }}> {faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom line after each question+answer */}
              <div
                className="w-full transition-colors duration-300"
                style={{
                  height: '1.5px',
                  backgroundColor:
                    (isActive(idx) && !openStates[idx]) || (idx + 1 < faqs.length && isActive(idx + 1)) ? '#1f98f4' : '#e5e7eb',
                }}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqSection; 